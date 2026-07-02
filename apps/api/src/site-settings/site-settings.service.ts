import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

// Single-row table; the id is fixed so there is always exactly one settings row.
const SINGLETON_ID = 'singleton';

@Injectable()
export class SiteSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  /** Public read — returns the singleton row, creating an empty one if needed. */
  get() {
    return this.prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID },
      update: {},
    });
  }

  /** Admin update — upserts the singleton row and revalidates the site. */
  async update(dto: UpdateSiteSettingsDto) {
    const settings = await this.prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, ...dto },
      update: { ...dto },
    });
    await this.revalidate.revalidate(['site-settings']);
    return settings;
  }
}
