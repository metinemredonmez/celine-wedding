import { Module } from '@nestjs/common';
import { DressesController } from './dresses.controller';
import { DressesService } from './dresses.service';

@Module({
  controllers: [DressesController],
  providers: [DressesService],
  exports: [DressesService],
})
export class DressesModule {}
