import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOkResponse({ description: 'Liveness + DB readiness probe.' })
  async check(): Promise<{ status: 'ok' | 'degraded'; db: 'up' | 'down'; ts: string }> {
    const ts = new Date().toISOString();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'up', ts };
    } catch {
      return { status: 'degraded', db: 'down', ts };
    }
  }
}
