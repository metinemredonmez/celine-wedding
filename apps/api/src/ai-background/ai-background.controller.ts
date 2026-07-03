import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AiBackgroundService } from './ai-background.service';
import { ReplaceBackgroundDto } from './dto/replace-background.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai-background')
@Controller('ai-background')
export class AiBackgroundController {
  constructor(private readonly service: AiBackgroundService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @ApiOkResponse({
    description: 'AI ile arka planı değiştirilmiş görsel (Cloudinary).',
  })
  replace(@Body() dto: ReplaceBackgroundDto) {
    return this.service.replace(dto.imageUrl, dto.prompt);
  }
}
