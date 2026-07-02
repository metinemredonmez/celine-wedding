import { Module } from '@nestjs/common';
import { TryOnController } from './try-on.controller';
import { TryOnService } from './try-on.service';
import { HttpTryOnProvider } from './provider/http-try-on.provider';
import { TRYON_PROVIDER } from './provider/try-on.provider';

@Module({
  controllers: [TryOnController],
  providers: [
    TryOnService,
    HttpTryOnProvider,
    // Swap HttpTryOnProvider for the chosen provider here (single line).
    { provide: TRYON_PROVIDER, useExisting: HttpTryOnProvider },
  ],
})
export class TryOnModule {}
