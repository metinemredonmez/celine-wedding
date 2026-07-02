import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Turkish mobile number: optional +90 / 0 prefix, leading 5, 9 more digits.
// Accepts common separators (space, dash, parentheses) which are stripped conceptually
// by the boutique's front-end; here we validate the canonical, unformatted shape.
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

  @ApiPropertyOptional({ description: 'Preferred appointment date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  message?: string;

  /**
   * Honeypot. Real users never fill this; bots often do.
   * Must be empty — a non-empty value is rejected server-side.
   */
  @ApiPropertyOptional({ description: 'Honeypot — must be empty', default: '' })
  @IsOptional()
  @IsString()
  @Length(0, 0, { message: 'website must be empty' })
  website?: string;
}
