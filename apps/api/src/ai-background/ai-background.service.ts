import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MediaService } from '../media/media.service';
import {
  AI_BG_PROVIDER,
  type AiBackgroundProvider,
} from './provider/ai-background.provider';

@Injectable()
export class AiBackgroundService {
  constructor(
    @Inject(AI_BG_PROVIDER) private readonly provider: AiBackgroundProvider,
    private readonly media: MediaService,
  ) {}

  /** Kaynak görselin arka planını AI ile değiştirir, sonucu Cloudinary'e yükler. */
  async replace(imageUrl: string, prompt: string) {
    // 1) Kaynak görseli indir.
    let src: Response;
    try {
      src = await fetch(imageUrl);
    } catch {
      throw new BadRequestException('Kaynak görsel indirilemedi.');
    }
    if (!src.ok) {
      throw new BadRequestException('Kaynak görsel indirilemedi.');
    }
    const bytes = Buffer.from(await src.arrayBuffer());
    const contentType = src.headers.get('content-type') ?? 'image/jpeg';

    // 2) AI ile arka planı değiştir.
    const result = await this.provider.replace({
      imageBytes: bytes,
      contentType,
      prompt,
    });
    if (result.status !== 'DONE' || !result.bytes) {
      throw new BadRequestException(
        result.error ?? 'AI arka plan üretilemedi.',
      );
    }

    // 3) Sonucu Cloudinary'e yükle → {url, publicId, width, height}.
    return this.media.uploadBuffer(
      result.bytes,
      'celine/ai-bg',
      result.contentType ?? 'image/png',
    );
  }
}
