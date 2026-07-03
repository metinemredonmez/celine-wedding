import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  /** Public read — tüm içerik anahtar/değer haritası. */
  async getAll(): Promise<Record<string, string>> {
    const rows = await this.prisma.content.findMany();
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    return map;
  }

  /** Admin update — verilen anahtarları upsert eder, siteyi revalidate eder. */
  async update(dto: UpdateContentDto): Promise<Record<string, string>> {
    if (dto.items.length > 0) {
      await this.prisma.$transaction(
        dto.items.map((item) =>
          this.prisma.content.upsert({
            where: { key: item.key },
            create: { key: item.key, value: item.value },
            update: { value: item.value },
          }),
        ),
      );
      await this.revalidate.revalidate(['content']);
    }
    return this.getAll();
  }
}
