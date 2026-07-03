import {
  ArrayMaxSize,
  IsArray,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ContentEntryDto {
  @ApiProperty({ description: 'İçerik anahtarı (CONTENT_REGISTRY ile eşleşir)' })
  @IsString()
  @MaxLength(200)
  key!: string;

  @ApiProperty({ description: 'Metin ya da görsel URL değeri' })
  @IsString()
  @MaxLength(20000)
  value!: string;
}

export class UpdateContentDto {
  @ApiProperty({ type: [ContentEntryDto] })
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ContentEntryDto)
  items!: ContentEntryDto[];
}
