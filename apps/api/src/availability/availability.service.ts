import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AvailabilityRuleDto,
  UpdateAvailabilityRuleDto,
} from './dto/availability-rule.dto';
import { BlockedDateDto } from './dto/blocked-date.dto';

export interface Slot {
  start: string; // ISO
  end: string; // ISO
  available: boolean;
}

const ACTIVE: AppointmentStatus[] = [
  AppointmentStatus.NEW,
  AppointmentStatus.CONTACTED,
];

// Türkiye sabit UTC+3 (DST yok). Sunucu TZ'sinden bağımsız, mutlak an üretiyoruz.
const IST_OFFSET_MS = 3 * 60 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Bir anın İstanbul takvimindeki YYYY-MM-DD karşılığı. */
export function istanbulDateString(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** İstanbul gün başlangıcı (00:00 +03:00) — mutlak an. */
export function istanbulDayStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+03:00`);
}

/** İstanbul takvimine göre haftanın günü (0=Pazar..6=Cumartesi). */
export function istanbulWeekday(dateStr: string): number {
  // İstanbul öğlen = 09:00 UTC aynı gün → getUTCDay İstanbul gününü verir.
  return new Date(`${dateStr}T12:00:00+03:00`).getUTCDay();
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────── PUBLIC ───────────────────────────

  /** Bookable slots for a given Istanbul day (rules − blocked days − booked − past). */
  async getSlots(dateStr: string): Promise<Slot[]> {
    if (!DATE_RE.test(dateStr)) {
      return [];
    }
    const dayStart = istanbulDayStart(dateStr);
    if (Number.isNaN(dayStart.getTime())) {
      return [];
    }
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    const weekday = istanbulWeekday(dateStr);

    // Full-day closure overrides everything.
    const blocked = await this.prisma.blockedDate.findFirst({
      where: { date: { gte: dayStart, lte: dayEnd } },
      select: { id: true },
    });
    if (blocked) {
      return [];
    }

    const rules = await this.prisma.availabilityRule.findMany({
      where: { weekday, active: true },
      orderBy: { startMinutes: 'asc' },
    });
    if (rules.length === 0) {
      return [];
    }

    const booked = await this.prisma.appointment.findMany({
      where: {
        // Geceyi aşan randevuları da yakala: pencereyi maksimum süre kadar genişlet.
        startsAt: { gte: new Date(dayStart.getTime() - 480 * 60_000), lte: dayEnd },
        status: { in: ACTIVE },
      },
      select: { startsAt: true, durationMin: true },
    });
    const busy = booked
      .filter((a): a is { startsAt: Date; durationMin: number | null } => a.startsAt !== null)
      .map((a) => {
        const s = a.startsAt.getTime();
        return { s, e: s + (a.durationMin ?? 60) * 60_000 };
      });

    const now = Date.now();
    const slots: Slot[] = [];
    for (const rule of rules) {
      for (
        let t = rule.startMinutes;
        t + rule.slotMinutes <= rule.endMinutes;
        t += rule.slotMinutes
      ) {
        const start = new Date(dayStart.getTime() + t * 60_000);
        const end = new Date(start.getTime() + rule.slotMinutes * 60_000);
        const overlaps = busy.some((b) => start.getTime() < b.e && b.s < end.getTime());
        // Başlamış bir slot artık rezerve edilemez.
        const isPast = start.getTime() <= now;
        slots.push({
          start: start.toISOString(),
          end: end.toISOString(),
          available: !overlaps && !isPast,
        });
      }
    }

    slots.sort((a, b) => a.start.localeCompare(b.start));
    return slots;
  }

  /**
   * Rezervasyon doğrulaması: verilen an, o günün kurallara göre üretilmiş ve
   * hâlâ müsait bir slot başlangıcı mı? Değilse null.
   */
  async findBookableSlot(startsAt: Date): Promise<Slot | null> {
    const slots = await this.getSlots(istanbulDateString(startsAt));
    const iso = startsAt.toISOString();
    return slots.find((s) => s.start === iso) ?? null;
  }

  // ─────────────────────── ADMIN: rules ───────────────────────

  listRules() {
    return this.prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { startMinutes: 'asc' }],
    });
  }

  createRule(dto: AvailabilityRuleDto) {
    this.assertRuleWindow(dto.startMinutes, dto.endMinutes, dto.slotMinutes ?? 60);
    return this.prisma.availabilityRule.create({ data: dto });
  }

  async updateRule(id: string, dto: UpdateAvailabilityRuleDto) {
    const existing = await this.prisma.availabilityRule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Availability rule "${id}" not found`);
    }
    this.assertRuleWindow(
      dto.startMinutes ?? existing.startMinutes,
      dto.endMinutes ?? existing.endMinutes,
      dto.slotMinutes ?? existing.slotMinutes,
    );
    return this.prisma.availabilityRule.update({ where: { id }, data: dto });
  }

  async removeRule(id: string) {
    const rule = await this.prisma.availabilityRule.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!rule) {
      throw new NotFoundException(`Availability rule "${id}" not found`);
    }
    await this.prisma.availabilityRule.delete({ where: { id } });
    return { id, deleted: true };
  }

  private assertRuleWindow(start: number, end: number, slot: number): void {
    if (end <= start) {
      throw new BadRequestException('endMinutes, startMinutes değerinden büyük olmalı');
    }
    if (end - start < slot) {
      throw new BadRequestException('Zaman aralığı en az bir slot uzunluğunda olmalı');
    }
  }

  // ─────────────────── ADMIN: blocked dates ───────────────────

  listBlocked() {
    return this.prisma.blockedDate.findMany({ orderBy: { date: 'asc' } });
  }

  createBlocked(dto: BlockedDateDto) {
    // Gün, İstanbul günü olarak sabitlenir (TZ kaymasına karşı).
    const day = dto.date.slice(0, 10);
    if (!DATE_RE.test(day)) {
      throw new BadRequestException('date YYYY-MM-DD olmalı');
    }
    return this.prisma.blockedDate.create({
      data: { date: istanbulDayStart(day), reason: dto.reason ?? null },
    });
  }

  async removeBlocked(id: string) {
    const blocked = await this.prisma.blockedDate.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!blocked) {
      throw new NotFoundException(`Blocked date "${id}" not found`);
    }
    await this.prisma.blockedDate.delete({ where: { id } });
    return { id, deleted: true };
  }
}
