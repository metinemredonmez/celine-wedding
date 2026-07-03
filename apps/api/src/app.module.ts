import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './common/config/validate-env';
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
import { ContentModule } from './content/content.module';
import { TryOnModule } from './try-on/try-on.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Global IP başına taban limit; hassas uçlar kendi @Throttle'ı ile sıkılır.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
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
    ContentModule,
    TryOnModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
