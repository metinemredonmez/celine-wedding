import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { SignUploadDto } from './dto/sign-upload.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('sign')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description:
      'Cloudinary signature + params for a signed direct browser upload. ' +
      'The API secret never leaves the server.',
  })
  sign(@Body() dto: SignUploadDto) {
    return this.mediaService.sign(dto);
  }
}
