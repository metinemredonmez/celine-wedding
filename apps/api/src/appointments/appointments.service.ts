import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

// Statuses that still "hold" a calendar slot (DONE/CANCELLED free it).
const ACTIVE: AppointmentStatus[] = [
  AppointmentStatus.NEW,
  AppointmentStatus.CONTACTED,
];

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateAppointmentDto) {
    // `website` is the honeypot — never persisted.
    const { website: _honeypot, preferredDate, startsAt, durationMin, ...rest } = dto;

    let starts: Date | null = null;
    let duration: number | null = null;
    if (startsAt) {
      starts = new Date(startsAt);
      duration = durationMin ?? 60;
      await this.assertSlotFree(starts, duration);
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        ...rest,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        startsAt: starts,
        durationMin: duration,
      },
    });

    // Best-effort notifications. Never blocks/fails the request.
    await this.mail.sendAppointmentNotifications(appointment).catch(() => undefined);

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
    if (from || to) {
      where.startsAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
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

  /** Reject the booking if it overlaps another active appointment. */
  private async assertSlotFree(startsAt: Date, durationMin: number): Promise<void> {
    const start = startsAt.getTime();
    const end = start + durationMin * 60_000;

    const dayStart = new Date(startsAt);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(startsAt);
    dayEnd.setHours(23, 59, 59, 999);

    const sameDay = await this.prisma.appointment.findMany({
      where: {
        startsAt: { gte: dayStart, lte: dayEnd },
        status: { in: ACTIVE },
      },
      select: { startsAt: true, durationMin: true },
    });

    const clash = sameDay.some((a) => {
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
