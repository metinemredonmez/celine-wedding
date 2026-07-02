import { Inject, Injectable } from '@nestjs/common';
import {
  STORAGE_PROVIDER,
  type SignedUpload,
  type StorageProvider,
} from './storage/storage.interface';
import { SignUploadDto } from './dto/sign-upload.dto';

const DEFAULT_FOLDER = 'celine';

@Injectable()
export class MediaService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  /** Sign a direct-to-Cloudinary upload for the admin browser. */
  sign(dto: SignUploadDto): SignedUpload {
    return this.storage.signUpload({
      folder: dto.folder ?? DEFAULT_FOLDER,
      publicId: dto.publicId,
    });
  }

  /** Remove an asset from Cloudinary by public id. */
  destroy(publicId: string): Promise<void> {
    return this.storage.destroy(publicId);
  }
}
