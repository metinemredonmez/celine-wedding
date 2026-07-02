import { Injectable } from '@nestjs/common';
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

  // TODO: protect with admin JWT guard (see docs/DATA-MODEL.md §3–4).
  findAll() {
    return this.prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
