import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class AvailabilityRuleDto {
  @ApiProperty({ minimum: 0, maximum: 6, description: '0=Pazar … 6=Cumartesi' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @ApiProperty({ description: 'Gün başından dakika (600 = 10:00)', minimum: 0, maximum: 1439 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1439)
  startMinutes: number;

  @ApiProperty({ description: 'Gün başından dakika (1140 = 19:00)', minimum: 1, maximum: 1440 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  endMinutes: number;

  @ApiPropertyOptional({ default: 60, description: 'Slot uzunluğu (dk)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  slotMinutes?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateAvailabilityRuleDto extends PartialType(AvailabilityRuleDto) {}
