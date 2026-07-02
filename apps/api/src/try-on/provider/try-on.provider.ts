// Provider abstraction for Virtual Try-On (AI). Swap the concrete provider
// (fal.ai, Replicate IDM-VTON, Kolors, Google, …) without touching the service.

export const TRYON_PROVIDER = Symbol('TRYON_PROVIDER');

export interface TryOnInput {
  personImageUrl: string;
  garmentImageUrl: string;
}

export interface TryOnResult {
  status: 'DONE' | 'PENDING' | 'FAILED';
  resultUrl?: string;
  jobId?: string;
  error?: string;
  provider: string;
}

export interface TryOnProvider {
  readonly name: string;
  generate(input: TryOnInput): Promise<TryOnResult>;
}
