import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { DressesController } from './dresses.controller';
import { DressesService } from './dresses.service';

@Module({
  imports: [AuthModule, MediaModule],
  controllers: [DressesController],
  providers: [DressesService],
  exports: [DressesService],
})
export class DressesModule {}
