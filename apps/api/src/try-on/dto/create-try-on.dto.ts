import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTryOnDto {
  @ApiProperty({ description: 'Gelin fotoğrafı URL (önce /media/sign ile yüklenir)' })
  @IsUrl()
  personImageUrl: string;

  @ApiPropertyOptional({ description: 'Gelinlik id — garmentImageUrl verilmezse kapak görseli kullanılır' })
  @IsOptional()
  @IsString()
  dressId?: string;

  @ApiPropertyOptional({ description: 'Açık gelinlik görseli URL (dress kapağını ezer)' })
  @IsOptional()
  @IsUrl()
  garmentImageUrl?: string;
}
