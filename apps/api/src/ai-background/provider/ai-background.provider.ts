/**
 * AI arka plan sağlayıcı portu (sağlayıcı-bağımsız).
 * Bir görselin arka planını, verilen komuta (prompt) göre AI ile değiştirir.
 * Bugün HTTP tabanlı (Photoroom / ClipDrop); farklı bir servis aynı arayüzü
 * uygulayarak takılabilir. Detay: docs/AI-BACKGROUND.md.
 */
export interface AiBgInput {
  imageBytes: Buffer;
  contentType: string;
  /** Yeni arka plan için doğal dil komutu (ör. "zarif beyaz stüdyo"). */
  prompt: string;
}

export interface AiBgResult {
  status: 'DONE' | 'FAILED';
  provider: string;
  /** DONE ise sonuç görselinin baytları. */
  bytes?: Buffer;
  contentType?: string;
  error?: string;
}

export interface AiBackgroundProvider {
  readonly name: string;
  replace(input: AiBgInput): Promise<AiBgResult>;
}

export const AI_BG_PROVIDER = Symbol('AI_BG_PROVIDER');
