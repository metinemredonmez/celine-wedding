import { IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplaceBackgroundDto {
  @ApiProperty({ description: 'Kaynak görsel URL (Cloudinary)' })
  @IsUrl()
  imageUrl!: string;

  @ApiProperty({
    description: 'Yeni arka plan komutu (ör. "zarif beyaz stüdyo")',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  prompt!: string;
}
