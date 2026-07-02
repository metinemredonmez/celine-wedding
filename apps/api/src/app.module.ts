import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RevalidateModule } from './revalidate/revalidate.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { HealthModule } from './health/health.module';
import { CollectionsModule } from './collections/collections.module';
import { DressesModule } from './dresses/dresses.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RevalidateModule,
    AuthModule,
    MediaModule,
    HealthModule,
    CollectionsModule,
    DressesModule,
    AppointmentsModule,
    SiteSettingsModule,
  ],
})
export class AppModule {}
