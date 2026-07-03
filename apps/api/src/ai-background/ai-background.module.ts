import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { AiBackgroundController } from './ai-background.controller';
import { AiBackgroundService } from './ai-background.service';
import { HttpAiBackgroundProvider } from './provider/http-ai-background.provider';
import { AI_BG_PROVIDER } from './provider/ai-background.provider';

@Module({
  imports: [AuthModule, MediaModule],
  controllers: [AiBackgroundController],
  providers: [
    AiBackgroundService,
    HttpAiBackgroundProvider,
    // Farklı bir sağlayıcıya geçmek için bu tek satırı değiştirin.
    { provide: AI_BG_PROVIDER, useExisting: HttpAiBackgroundProvider },
  ],
})
export class AiBackgroundModule {}
