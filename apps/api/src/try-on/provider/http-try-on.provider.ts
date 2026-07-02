import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TryOnInput, TryOnProvider, TryOnResult } from './try-on.provider';

// Loose shape of a try-on API response — narrowed defensively below.
interface RawTryOnResponse {
  image_url?: string;
  result_url?: string;
  url?: string;
  output?: string[] | string;
  id?: string;
  request_id?: string;
}

/**
 * Generic, config-driven HTTP provider. Point TRYON_API_URL / TRYON_API_KEY /
 * TRYON_MODEL at the chosen service and adapt the request/response field names
 * to it (fal.ai, Replicate, Kolors, etc.). Sync responses return a resultUrl;
 * async ones return a jobId (poll separately). See docs/VIRTUAL-TRYON.md.
 */
@Injectable()
export class HttpTryOnProvider implements TryOnProvider {
  readonly name = 'http';

  constructor(private readonly config: ConfigService) {}

  async generate(input: TryOnInput): Promise<TryOnResult> {
    const url = this.config.get<string>('TRYON_API_URL');
    if (!url) {
      return {
        status: 'FAILED',
        provider: this.name,
        error: 'TRYON_API_URL not configured — pick a provider (docs/VIRTUAL-TRYON.md).',
      };
    }

    const key = this.config.get<string>('TRYON_API_KEY');

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { Authorization: `Bearer ${key}` } : {}),
        },
        body: JSON.stringify({
          model: this.config.get<string>('TRYON_MODEL'),
          // Adapt these field names to the chosen provider's schema.
          person_image_url: input.personImageUrl,
          garment_image_url: input.garmentImageUrl,
        }),
      });

      if (!res.ok) {
        return { status: 'FAILED', provider: this.name, error: `Provider responded ${res.status}` };
      }

      const data = (await res.json()) as RawTryOnResponse;
      const resultUrl =
        data.image_url ??
        data.result_url ??
        data.url ??
        (Array.isArray(data.output) ? data.output[0] : typeof data.output === 'string' ? data.output : undefined);

      if (resultUrl) {
        return { status: 'DONE', provider: this.name, resultUrl };
      }

      const jobId = data.id ?? data.request_id;
      return jobId
        ? { status: 'PENDING', provider: this.name, jobId }
        : { status: 'FAILED', provider: this.name, error: 'No result URL or job id in provider response' };
    } catch (err) {
      return {
        status: 'FAILED',
        provider: this.name,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
