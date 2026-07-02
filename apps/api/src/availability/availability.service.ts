import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────── PUBLIC ───────────────────────────

  /** Bookable slots for a given day (rules − blocked days − booked − past). */
  async getSlots(dateStr: string): Promise<Slot[]> {
    const dayStart = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(dayStart.getTime())) {
      return [];
    }
    const dayEnd = new Date(`${dateStr}T23:59:59.999`);
    const weekday = dayStart.getDay();

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
        startsAt: { gte: dayStart, lte: dayEnd },
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
        const start = new Date(dayStart);
        start.setMinutes(t);
        const end = new Date(start.getTime() + rule.slotMinutes * 60_000);
        const overlaps = busy.some((b) => start.getTime() < b.e && b.s < end.getTime());
        const isPast = end.getTime() <= now;
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

  // ─────────────────────── ADMIN: rules ───────────────────────

  listRules() {
    return this.prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { startMinutes: 'asc' }],
    });
  }

  createRule(dto: AvailabilityRuleDto) {
    return this.prisma.availabilityRule.create({ data: dto });
  }

  async updateRule(id: string, dto: UpdateAvailabilityRuleDto) {
    await this.ensureRule(id);
    return this.prisma.availabilityRule.update({ where: { id }, data: dto });
  }

  async removeRule(id: string) {
    await this.ensureRule(id);
    await this.prisma.availabilityRule.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async ensureRule(id: string) {
    const rule = await this.prisma.availabilityRule.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!rule) {
      throw new NotFoundException(`Availability rule "${id}" not found`);
    }
  }

  // ─────────────────── ADMIN: blocked dates ───────────────────

  listBlocked() {
    return this.prisma.blockedDate.findMany({ orderBy: { date: 'asc' } });
  }

  createBlocked(dto: BlockedDateDto) {
    return this.prisma.blockedDate.create({
      data: { date: new Date(dto.date), reason: dto.reason ?? null },
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
