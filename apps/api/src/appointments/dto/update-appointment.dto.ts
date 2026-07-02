import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentDto {
  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.CONTACTED })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
