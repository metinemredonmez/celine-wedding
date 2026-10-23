import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TryOnInput, TryOnProvider, TryOnResult } from './try-on.provider';

/**
 * fal.ai sanal deneme sağlayıcısı (kuyruk ucu).
 *
 * Akış: POST queue.fal.run/{model} → request_id + status_url + response_url
 * döner → status_url COMPLETED olana dek yoklanır → response_url'den sonuç
 * görseli alınır. Kuyruk ucu tercih edildi: senkron fal.run soğuk başlangıçta
 * 25-120 sn bağlantıyı tutuyor ve nginx/istemci zaman aşımına düşüyordu
 * (virtual-textile'da ölçüldü).
 *
 * İstek gövdesi MODELE göre kurulur — her modelin şeması farklı, tek gövdeyi
 * hepsine göndermek 422 üretir. Varsayılan: fashn/tryon (sıcak kalan popüler
 * model, ~3-20 sn).
 *
 * env: TRYON_API_KEY (fal anahtarı), TRYON_MODEL (ör. fal-ai/fashn/tryon/v1.6),
 *      TRYON_API_URL (ops., kuyruk tabanını ezer — test/stub için).
 */
const DEFAULT_MODEL = 'fal-ai/fashn/tryon/v1.6';
const QUEUE_BASE_URL = 'https://queue.fal.run';
const POLL_INTERVAL_MS = 1_500;
const MAX_WAIT_MS = 150_000;

type Json = Record<string, unknown>;

/** fashn ailesi: gelinlik = one-pieces; quality modu (gelinlikte detay önemli). */
function fashnBody(input: TryOnInput): Json {
  return {
    model_image: input.personImageUrl,
    garment_image: input.garmentImageUrl,
    category: 'one-pieces',
    mode: 'quality',
    output_format: 'jpeg',
  };
}

/** idm-vton: `description` zorunlu (yokluğu 422 — virtual-textile'da yaşandı). */
function idmVtonBody(input: TryOnInput): Json {
  return {
    human_image_url: input.personImageUrl,
    garment_image_url: input.garmentImageUrl,
    category: 'dresses',
    description: 'a full-length wedding dress',
  };
}

// Önekle eşleşir: model kimlikleri sürüm taşır (…/tryon/v1.6).
const BODY_BUILDERS: ReadonlyArray<{ prefix: string; build: (i: TryOnInput) => Json }> = [
  { prefix: 'fal-ai/fashn/', build: fashnBody },
  { prefix: 'fal-ai/idm-vton', build: idmVtonBody },
];

function readString(obj: unknown, key: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const v = (obj as Json)[key];
  return typeof v === 'string' ? v : undefined;
}

/** Sonuç görseli: `images[0].url` (fashn, idm-vton) ya da `image.url`. */
function extractImageUrl(json: unknown): string | undefined {
  if (!json || typeof json !== 'object') return undefined;
  const j = json as Json;
  const list = Array.isArray(j.images) ? (j.images[0] as unknown) : undefined;
  return readString(list, 'url') ?? readString(j.image, 'url');
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

@Injectable()
export class FalTryOnProvider implements TryOnProvider {
  readonly name = 'fal';
  private readonly logger = new Logger(FalTryOnProvider.name);

  constructor(private readonly config: ConfigService) {}

  private get model(): string {
    return this.config.get<string>('TRYON_MODEL') || DEFAULT_MODEL;
  }

  private get queueBase(): string {
    return (this.config.get<string>('TRYON_API_URL') || QUEUE_BASE_URL).replace(/\/$/, '');
  }

  private headers(json = false): Record<string, string> {
    const key = this.config.get<string>('TRYON_API_KEY') ?? '';
    return {
      // fal şeması: "Key <anahtar>" — "Bearer" DEĞİL.
      Authorization: `Key ${key}`,
      ...(json ? { 'Content-Type': 'application/json' } : {}),
    };
  }

  /** Hata metni: durum kodu + gövdenin ilk 200 karakteri (fal `detail` alanında sebebi yazar). */
  private async fail(res: Response, step: string): Promise<TryOnResult> {
    const text = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200);
    return { status: 'FAILED', provider: this.name, error: `fal ${step} ${res.status}: ${text}` };
  }

  async generate(input: TryOnInput): Promise<TryOnResult> {
    if (!this.config.get<string>('TRYON_API_KEY')) {
      return { status: 'FAILED', provider: this.name, error: 'TRYON_API_KEY ayarlı değil.' };
    }
    const model = this.model;
    const builder = BODY_BUILDERS.find((b) => model.startsWith(b.prefix));
    if (!builder) {
      return { status: 'FAILED', provider: this.name, error: `Desteklenmeyen TRYON_MODEL: ${model}` };
    }

    try {
      // 1) Gönder
      const submit = await fetch(`${this.queueBase}/${model}`, {
        method: 'POST',
        headers: this.headers(true),
        body: JSON.stringify(builder.build(input)),
      });
      if (!submit.ok) return this.fail(submit, 'submit');
      const submitted = (await submit.json()) as unknown;

      // Kuyruk adresleri yoksa gövde zaten sonuçtur (senkron uç / önbellek).
      const statusUrl = readString(submitted, 'status_url');
      const responseUrl = readString(submitted, 'response_url');
      const jobId = readString(submitted, 'request_id');
      let result: unknown = submitted;

      if (statusUrl && responseUrl) {
        // 2) Yokla
        const deadline = Date.now() + MAX_WAIT_MS;
        for (;;) {
          if (Date.now() >= deadline) {
            return { status: 'FAILED', provider: this.name, jobId, error: 'fal kuyruk beklemesi aşıldı (150 sn).' };
          }
          await sleep(POLL_INTERVAL_MS);
          const st = await fetch(statusUrl, { headers: this.headers() });
          if (!st.ok) return { ...(await this.fail(st, 'status')), jobId };
          const stage = readString(await st.json(), 'status');
          if (stage === 'COMPLETED') break;
          if (stage !== 'IN_QUEUE' && stage !== 'IN_PROGRESS') {
            return { status: 'FAILED', provider: this.name, jobId, error: `fal beklenmeyen durum: ${stage ?? 'yok'}` };
          }
        }
        // 3) Sonucu al
        const res = await fetch(responseUrl, { headers: this.headers() });
        if (!res.ok) return { ...(await this.fail(res, 'result')), jobId };
        result = await res.json();
      }

      // İçerik güvenliği: 200 OK ama üretim reddedilmiş olabilir (siyah görsel + bayrak).
      const nsfw = (result as Json | null)?.has_nsfw_concepts;
      if (Array.isArray(nsfw) && nsfw.some((f) => f === true)) {
        return { status: 'FAILED', provider: this.name, jobId, error: 'Fotoğraf içerik filtresine takıldı.' };
      }

      const resultUrl = extractImageUrl(result);
      if (!resultUrl) {
        const preview = JSON.stringify(result).slice(0, 200);
        return { status: 'FAILED', provider: this.name, jobId, error: `fal yanıtında görsel yok: ${preview}` };
      }
      return { status: 'DONE', provider: this.name, jobId, resultUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`fal try-on failed: ${message}`);
      return { status: 'FAILED', provider: this.name, error: message };
    }
  }
}
