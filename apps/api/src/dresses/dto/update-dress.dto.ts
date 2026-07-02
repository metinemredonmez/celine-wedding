import { PartialType } from '@nestjs/swagger';
import { CreateDressDto } from './create-dress.dto';

export class UpdateDressDto extends PartialType(CreateDressDto) {}
