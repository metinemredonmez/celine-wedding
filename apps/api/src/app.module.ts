import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { CollectionsModule } from './collections/collections.module';
import { DressesModule } from './dresses/dresses.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    CollectionsModule,
    DressesModule,
    AppointmentsModule,
  ],
})
export class AppModule {}
