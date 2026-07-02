import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CloudinaryProvider } from './storage/cloudinary.provider';
import { STORAGE_PROVIDER } from './storage/storage.interface';

@Module({
  imports: [AuthModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    CloudinaryProvider,
    { provide: STORAGE_PROVIDER, useExisting: CloudinaryProvider },
  ],
  exports: [MediaService],
})
export class MediaModule {}
