import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TryOnController } from './try-on.controller';
import { TryOnService } from './try-on.service';
import { FalTryOnProvider } from './provider/fal-try-on.provider';
import { HttpTryOnProvider } from './provider/http-try-on.provider';
import { TRYON_PROVIDER, type TryOnProvider } from './provider/try-on.provider';

@Module({
  controllers: [TryOnController],
  providers: [
    TryOnService,
    FalTryOnProvider,
    HttpTryOnProvider,
    {
      provide: TRYON_PROVIDER,
      // TRYON_PROVIDER=fal → fal.ai (varsayılan); başka değer → generic HTTP.
      // Yeni sağlayıcı: TryOnProvider yaz, burada bir satır ekle.
      inject: [ConfigService, FalTryOnProvider, HttpTryOnProvider],
      useFactory: (
        config: ConfigService,
        fal: FalTryOnProvider,
        http: HttpTryOnProvider,
      ): TryOnProvider => {
        const name = config.get<string>('TRYON_PROVIDER') || 'fal';
        return name === 'http' ? http : fal;
      },
    },
  ],
})
export class TryOnModule {}
