import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateAppointmentDto) {
    // `website` is the honeypot — never persisted.
    const { website: _honeypot, preferredDate, ...rest } = dto;

    const appointment = await this.prisma.appointment.create({
      data: {
        ...rest,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        // status defaults to NEW at the schema level.
      },
    });

    // Best-effort: owner notification + customer confirmation. Never blocks/fails.
    await this.mail.sendAppointmentNotifications(appointment).catch(() => undefined);

    return {
      id: appointment.id,
      status: appointment.status,
      createdAt: appointment.createdAt,
    };
  }

  /** Admin: all appointments, newest first. */
  findAll() {
    return this.prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Admin: move an appointment through its status pipeline (NEW→CONTACTED→DONE / CANCELLED). */
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
}
