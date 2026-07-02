import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsString,
  IsIn,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DressStatus } from '@prisma/client';

/** Admin list query. Unlike the public query, status is a filter (all by default). */
export class AdminQueryDressDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number (1-based)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ enum: DressStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(DressStatus)
  status?: DressStatus;

  @ApiPropertyOptional({ description: 'Filter by collection slug' })
  @IsOptional()
  @IsString()
  collection?: string;

  @ApiPropertyOptional({ description: 'Filter by featured flag' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ enum: ['order', 'createdAt', 'updatedAt', 'name'], default: 'order' })
  @IsOptional()
  @IsIn(['order', 'createdAt', 'updatedAt', 'name'])
  sort: 'order' | 'createdAt' | 'updatedAt' | 'name' = 'order';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  dir: 'asc' | 'desc' = 'asc';
}
