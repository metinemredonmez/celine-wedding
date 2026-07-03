/** Parameters the client must echo back to Cloudinary's upload endpoint. */
export interface SignedUpload {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Storage provider port. Today backed by Cloudinary (signed direct upload); a
 * future S3/MinIO adapter can implement the same interface without touching the
 * media service.
 */
/** Server-side upload result (e.g. AI-generated image bytes). */
export interface UploadedAsset {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export interface StorageProvider {
  /** Produce a signature + params for a browser direct-to-storage upload. */
  signUpload(params: { folder: string; publicId?: string }): SignedUpload;

  /** Server-side upload of raw bytes (AI outputs etc.). */
  uploadBuffer(
    buffer: Buffer,
    folder: string,
    contentType?: string,
  ): Promise<UploadedAsset>;

  /** Delete an asset by its provider public id. */
  destroy(publicId: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
