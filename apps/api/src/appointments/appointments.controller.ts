import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ─────────────────────────── PUBLIC ───────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Create an appointment. If `startsAt` is sent, the slot is checked for conflicts.',
  })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  // ─────────────────────────── ADMIN ───────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'from', required: false, description: 'ISO — startsAt >= from (calendar)' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO — startsAt <= to (calendar)' })
  @ApiOkResponse({ description: 'List appointments (admin); optional date range for the calendar.' })
  findAll(@Query('from') from?: string, @Query('to') to?: string) {
    return this.appointmentsService.findAll(from, to);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Appointment id' })
  @ApiOkResponse({ description: 'Update appointment status (admin).' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.updateStatus(id, dto.status);
  }
}
