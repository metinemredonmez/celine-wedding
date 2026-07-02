import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SignUploadDto {
  @ApiPropertyOptional({
    description: 'Target Cloudinary folder',
    default: 'celine',
  })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Matches(/^[a-zA-Z0-9_\-/]+$/, {
    message: 'folder may only contain letters, numbers, underscore, dash and slash',
  })
  folder?: string;

  @ApiPropertyOptional({ description: 'Desired public_id (optional)' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  @Matches(/^[a-zA-Z0-9_\-/]+$/, {
    message: 'publicId may only contain letters, numbers, underscore, dash and slash',
  })
  publicId?: string;
}
