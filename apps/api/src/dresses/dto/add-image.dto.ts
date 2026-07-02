import { IsInt, IsOptional, IsString, IsUrl, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Attach an already-uploaded Cloudinary asset to a dress. The browser uploads
 * directly to Cloudinary (after `POST /media/sign`) and echoes the returned
 * metadata here. `order` defaults to max+1 server-side when omitted.
 */
export class AddImageDto {
  @ApiProperty({ description: 'Cloudinary secure_url' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Cloudinary public_id (unique)' })
  @IsString()
  @Length(1, 200)
  publicId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 300)
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  height?: number;
}
