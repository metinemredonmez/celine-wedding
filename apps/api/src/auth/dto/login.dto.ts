import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'seda@celinegelinlik.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'super-secret', minLength: 8, maxLength: 128 })
  @IsString()
  @Length(8, 128)
  password: string;
}
