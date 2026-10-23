import { IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Yaklaşık 6 MB base64 → ~4,5 MB görsel; tarayıcı zaten 1536 px'e küçültüp gönderir. */
const MAX_INLINE_IMAGE_CHARS = 8_000_000;

export class CreateTryOnDto {
  @ApiPropertyOptional({ description: 'Gelin fotoğrafı URL (önce /media/sign ile yüklenmişse)' })
  @IsOptional()
  @IsUrl()
  personImageUrl?: string;

  @ApiPropertyOptional({
    description:
      'Gelin fotoğrafı, base64 data URI (data:image/jpeg;base64,…). Herkese açık demo bunu ' +
      'kullanır: fotoğraf saklanmaz, yalnız AI sağlayıcısına iletilir. personImageUrl yerine.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_INLINE_IMAGE_CHARS)
  @Matches(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/, {
    message: 'personImage geçerli bir JPEG/PNG/WebP data URI olmalı',
  })
  personImage?: string;

  @ApiPropertyOptional({ description: 'Gelinlik id — garmentImageUrl verilmezse kapak görseli kullanılır' })
  @IsOptional()
  @IsString()
  dressId?: string;

  @ApiPropertyOptional({ description: 'Açık gelinlik görseli URL (dress kapağını ezer)' })
  @IsOptional()
  @IsUrl()
  garmentImageUrl?: string;
}
