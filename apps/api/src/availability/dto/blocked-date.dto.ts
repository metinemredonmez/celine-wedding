import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BlockedDateDto {
  @ApiProperty({ example: '2026-07-15', description: 'Kapalı gün (ISO tarih)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Bayram tatili' })
  @IsOptional()
  @IsString()
  reason?: string;
}
