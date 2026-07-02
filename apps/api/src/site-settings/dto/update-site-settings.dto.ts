import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSiteSettingsDto {
  @ApiPropertyOptional({ example: '+90 5xx xxx xx xx' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'WhatsApp number in wa.me form, e.g. 90XXXXXXXXXX' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'https://www.instagram.com/celinegelinlik/' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ example: 'İdealtepe Mah. Panaroma Sok. No:5 D:7, Maltepe / İstanbul' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Google Maps embed/share URL' })
  @IsOptional()
  @IsString()
  mapUrl?: string;

  @ApiPropertyOptional({ description: 'Atölye / hakkımızda kısa metni' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ description: 'Ana ekran arka plan fotoğrafı (URL)' })
  @IsOptional()
  @IsString()
  heroImage?: string;

  @ApiPropertyOptional({
    description: 'Ana ekran arka plan videosu (URL) — foto yerine oynatılır',
  })
  @IsOptional()
  @IsString()
  heroVideo?: string;
}
