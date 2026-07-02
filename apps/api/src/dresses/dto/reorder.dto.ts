import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Ordered list of ids. Position in the array becomes the new `order` value
 * (index 0 → order 0). Used for both dress reordering and gallery reordering.
 */
export class ReorderDto {
  @ApiProperty({
    description: 'Ids in the desired display order',
    type: [String],
    example: ['clx1', 'clx2', 'clx3'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
