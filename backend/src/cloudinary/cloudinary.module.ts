import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { IUploadService } from '../upload/interfaces/upload-service.interface';

@Module({
  providers: [
    CloudinaryProvider,
    CloudinaryService,
    // Provide IUploadService interface with CloudinaryService implementation
    {
      provide: 'IUploadService',
      useClass: CloudinaryService,
    },
  ],
  exports: [
    CloudinaryProvider,
    CloudinaryService,
    'IUploadService', // Export interface token so other modules can use it
  ],
})
export class CloudinaryModule {}
