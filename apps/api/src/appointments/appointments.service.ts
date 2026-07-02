import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  AvailabilityService,
  istanbulDateString,
} from '../availability/availability.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

// Statuses that still "hold" a calendar slot (DONE/CANCELLED free it).
const ACTIVE: AppointmentStatus[] = [
  AppointmentStatus.NEW,
  AppointmentStatus.CONTACTED,
];

// Şemadaki üst sınırla hizalı — çakışma penceresini bu kadar genişletiyoruz.
const MAX_DURATION_MIN = 480;

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly availability: AvailabilityService,
  ) {}

  async create(dto: CreateAppointmentDto) {
    // `website` is the honeypot — never persisted. Client `durationMin` is
    // IGNORED for slot bookings; the slot's own length is authoritative.
    const { website: _honeypot, preferredDate, startsAt, durationMin: _ignored, ...rest } = dto;

    let appointment;
    if (startsAt) {
      const starts = new Date(startsAt);
      if (Number.isNaN(starts.getTime())) {
        throw new BadRequestException('startsAt geçerli bir tarih olmalı');
      }

      // Kural + kapalı gün + geçmiş + doluluk: hepsi tek kaynaktan (getSlots).
      const slot = await this.availability.findBookableSlot(starts);
      if (!slot) {
        throw new UnprocessableEntityException(
          'Seçilen saat randevuya uygun değil. Lütfen takvimden uygun bir saat seçin.',
        );
      }
      if (!slot.available) {
        throw new ConflictException('Seçtiğiniz saat dolu, lütfen başka bir saat seçin.');
      }
      const duration = Math.round(
        (new Date(slot.end).getTime() - new Date(slot.start).getTime()) / 60_000,
      );

      // Aynı güne eşzamanlı rezervasyonları advisory lock ile serileştir
      // (check-then-create race'ini kapatır).
      const dayKey = Number(istanbulDateString(starts).replace(/-/g, ''));
      appointment = await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${dayKey}::bigint)`;
        await this.assertSlotFree(tx, starts, duration);
        return tx.appointment.create({
          data: {
            ...rest,
            preferredDate: preferredDate ? new Date(preferredDate) : null,
            startsAt: starts,
            durationMin: duration,
          },
        });
      });
    } else {
      // Serbest form talep (takvim slotu yok) — sadece tercih edilen tarih.
      appointment = await this.prisma.appointment.create({
        data: {
          ...rest,
          preferredDate: preferredDate ? new Date(preferredDate) : null,
          startsAt: null,
          durationMin: null,
        },
      });
    }

    // Fire-and-forget: SMTP yavaş/ulaşılamaz olsa bile public uç beklemez.
    void this.mail.sendAppointmentNotifications(appointment).catch(() => undefined);

    return {
      id: appointment.id,
      status: appointment.status,
      startsAt: appointment.startsAt,
      createdAt: appointment.createdAt,
    };
  }

  /** Admin list. Optional [from, to] filters on `startsAt` for a calendar view. */
  findAll(from?: string, to?: string) {
    const where: Prisma.AppointmentWhereInput = {};
    const gte = this.parseDate(from);
    const lte = this.parseDate(to);
    if (gte || lte) {
      where.startsAt = { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
    }
    return this.prisma.appointment.findMany({
      where,
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /** Admin: move an appointment through its status pipeline. */
  async updateStatus(id: string, status: AppointmentStatus) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Appointment "${id}" not found`);
    }
    return this.prisma.appointment.update({ where: { id }, data: { status } });
  }

  /** Geçersiz tarih string'lerini sessizce yok say (500 yerine filtresiz liste). */
  private parseDate(value?: string): Date | undefined {
    if (!value) {
      return undefined;
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  /**
   * Reject the booking if it overlaps another active appointment.
   * Pencere, geceyi aşan randevuları da yakalayacak şekilde her iki yönde
   * MAX_DURATION_MIN kadar genişletilir; TZ'den bağımsızdır.
   */
  private async assertSlotFree(
    tx: Prisma.TransactionClient,
    startsAt: Date,
    durationMin: number,
  ): Promise<void> {
    const start = startsAt.getTime();
    const end = start + durationMin * 60_000;

    const candidates = await tx.appointment.findMany({
      where: {
        startsAt: {
          gte: new Date(start - MAX_DURATION_MIN * 60_000),
          lt: new Date(end),
        },
        status: { in: ACTIVE },
      },
      select: { startsAt: true, durationMin: true },
    });

    const clash = candidates.some((a) => {
      if (!a.startsAt) {
        return false;
      }
      const s = a.startsAt.getTime();
      const e = s + (a.durationMin ?? 60) * 60_000;
      return start < e && s < end; // interval overlap
    });

    if (clash) {
      throw new ConflictException(
        'Seçtiğiniz saat dolu, lütfen başka bir saat seçin.',
      );
    }
  }
}
