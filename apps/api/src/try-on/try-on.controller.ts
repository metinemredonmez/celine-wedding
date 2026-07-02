import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TryOnService } from './try-on.service';
import { CreateTryOnDto } from './dto/create-try-on.dto';

@ApiTags('try-on')
@Controller('try-on')
export class TryOnController {
  constructor(private readonly tryOnService: TryOnService) {}

  // PUBLIC — gelin kendi fotoğrafıyla dener. AI çağrıları maliyetli:
  // IP başına saatte 5 istek; TRYON_PROVIDER=disabled ile tamamen kapatılabilir.
  @Post()
  @Throttle({ default: { ttl: 3_600_000, limit: 5 } })
  @ApiCreatedResponse({ description: 'Sanal deneme (AI) isteği oluştur ve çalıştır.' })
  create(@Body() dto: CreateTryOnDto) {
    return this.tryOnService.create(dto);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Try-on request id' })
  @ApiOkResponse({ description: 'Deneme isteğinin durumu/sonucu.' })
  findOne(@Param('id') id: string) {
    return this.tryOnService.findOne(id);
  }
}
