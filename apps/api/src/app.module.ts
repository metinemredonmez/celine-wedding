import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RevalidateModule } from './revalidate/revalidate.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { HealthModule } from './health/health.module';
import { CollectionsModule } from './collections/collections.module';
import { DressesModule } from './dresses/dresses.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AvailabilityModule } from './availability/availability.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { TryOnModule } from './try-on/try-on.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RevalidateModule,
    MailModule,
    AuthModule,
    MediaModule,
    HealthModule,
    CollectionsModule,
    DressesModule,
    AppointmentsModule,
    AvailabilityModule,
    SiteSettingsModule,
    TryOnModule,
  ],
})
export class AppModule {}
