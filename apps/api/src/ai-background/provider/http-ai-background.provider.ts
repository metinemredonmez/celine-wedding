import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AiBackgroundProvider,
  AiBgInput,
  AiBgResult,
} from './ai-background.provider';

/**
 * Config tabanlı HTTP sağlayıcı. AI_BG_PROVIDER ile servis seçilir
 * (photoroom | clipdrop), AI_BG_API_KEY ile anahtar verilir.
 * İkisi de "görsel + prompt → yeni görsel (binary)" akışını kullanır.
 * İsteğe bağlı AI_BG_ENDPOINT ile uç nokta ezilebilir. docs/AI-BACKGROUND.md.
 */
@Injectable()
export class HttpAiBackgroundProvider implements AiBackgroundProvider {
  readonly name = 'http';

  constructor(private readonly config: ConfigService) {}

  async replace(input: AiBgInput): Promise<AiBgResult> {
    const provider = (
      this.config.get<string>('AI_BG_PROVIDER') ?? 'clipdrop'
    ).toLowerCase();
    const key = this.config.get<string>('AI_BG_API_KEY');

    if (!key || key === 'CHANGEME') {
      return {
        status: 'FAILED',
        provider,
        error:
          'AI_BG_API_KEY ayarlı değil. Bir sağlayıcı seçip anahtarı .env’e ekleyin (docs/AI-BACKGROUND.md).',
      };
    }

    try {
      const form = new FormData();
      const blob = new Blob([new Uint8Array(input.imageBytes)], {
        type: input.contentType || 'image/png',
      });
      const headers: Record<string, string> = { 'x-api-key': key };
      let endpoint = this.config.get<string>('AI_BG_ENDPOINT') ?? '';

      if (provider === 'photoroom') {
        endpoint =
          endpoint || 'https://image-api.photoroom.com/v2/edit';
        form.append('imageFile', blob, 'input.png');
        form.append('background.prompt', input.prompt);
        form.append('background.expandPrompt', 'true');
      } else {
        // clipdrop (varsayılan) — Replace Background v1
        endpoint = endpoint || 'https://clipdrop-api.co/replace-background/v1';
        form.append('image_file', blob, 'input.png');
        form.append('prompt', input.prompt);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        return {
          status: 'FAILED',
          provider,
          error: `Sağlayıcı ${res.status}: ${txt.slice(0, 200)}`,
        };
      }

      const ct = res.headers.get('content-type') ?? 'image/png';

      // Bazı sağlayıcılar JSON içinde URL döndürebilir.
      if (ct.includes('application/json')) {
        const j = (await res.json()) as Record<string, unknown>;
        const url =
          (j.result_url as string) ??
          (j.url as string) ??
          (j.image_url as string);
        if (typeof url === 'string' && url) {
          const r = await fetch(url);
          const buf = Buffer.from(await r.arrayBuffer());
          return {
            status: 'DONE',
            provider,
            bytes: buf,
            contentType: r.headers.get('content-type') ?? 'image/png',
          };
        }
        return { status: 'FAILED', provider, error: 'Yanıtta görsel yok.' };
      }

      const buf = Buffer.from(await res.arrayBuffer());
      return { status: 'DONE', provider, bytes: buf, contentType: ct };
    } catch (err) {
      return {
        status: 'FAILED',
        provider,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
