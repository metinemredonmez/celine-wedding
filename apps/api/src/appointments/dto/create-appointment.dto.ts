import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Turkish mobile number: optional +90 / 0 prefix, leading 5, 9 more digits.
const TR_MOBILE_REGEX = /^(?:\+90|0)?5\d{9}$/;

export class CreateAppointmentDto {
  @ApiProperty({ example: 'Ayşe Yılmaz' })
  @IsString()
  @Length(2, 120)
  name: string;

  @ApiProperty({ example: '+905321234567', description: 'Turkish mobile number' })
  @IsString()
  @Matches(TR_MOBILE_REGEX, {
    message: 'phone must be a valid Turkish mobile number',
  })
  phone: string;

  @ApiPropertyOptional({ example: 'ayse@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Preferred date (ISO) — free-form, when not booking a calendar slot' })
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @ApiPropertyOptional({ description: 'Booked calendar slot start (ISO 8601). Availability is checked server-side.' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ default: 60, description: 'Slot duration in minutes' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  durationMin?: number;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  message?: string;

  /** Honeypot — must be empty. */
  @ApiPropertyOptional({ description: 'Honeypot — must be empty', default: '' })
  @IsOptional()
  @IsString()
  @Length(0, 0, { message: 'website must be empty' })
  website?: string;
}
