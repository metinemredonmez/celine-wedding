import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAppointmentDto) {
    // `website` is the honeypot — never persisted.
    const { website: _honeypot, preferredDate, ...rest } = dto;

    return this.prisma.appointment.create({
      data: {
        ...rest,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        // status defaults to NEW at the schema level.
      },
      select: { id: true, status: true, createdAt: true },
    });
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
