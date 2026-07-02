import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Appointment request created (status defaults to NEW).' })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  // TODO: protect with admin JWT guard (see docs/DATA-MODEL.md). Public for now.
  @Get()
  @ApiOkResponse({ description: 'List appointments, newest first. (Will be admin-only.)' })
  findAll() {
    return this.appointmentsService.findAll();
  }
}
