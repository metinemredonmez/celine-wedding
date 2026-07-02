import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { SignedUpload, StorageProvider } from './storage.interface';

/**
 * Cloudinary adapter. Signs direct browser uploads (the API secret never leaves
 * the server) and deletes assets by public id. Byte payloads never pass through
 * Node — see docs/DATA-MODEL.md §5.
 */
@Injectable()
export class CloudinaryProvider implements StorageProvider {
  constructor(private readonly config: ConfigService) {}

  signUpload(params: { folder: string; publicId?: string }): SignedUpload {
    const timestamp = Math.round(Date.now() / 1000);
    const toSign: Record<string, string | number> = {
      timestamp,
      folder: params.folder,
      ...(params.publicId ? { public_id: params.publicId } : {}),
    };

    const signature = cloudinary.utils.api_sign_request(
      toSign,
      this.config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    );

    return {
      timestamp,
      signature,
      apiKey: this.config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      cloudName: this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      folder: params.folder,
    };
  }

  async destroy(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
      api_key: this.config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      cloud_name: this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
    });
  }
}
