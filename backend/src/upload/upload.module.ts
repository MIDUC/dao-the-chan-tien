import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

/**
 * Upload Module
 * 
 * This module provides file upload functionality.
 * It uses IUploadService interface which can be implemented by different providers
 * (Cloudinary, S3, Local Storage, etc.)
 * 
 * To switch providers, change the provider in CloudinaryModule.
 */
@Module({
  imports: [CloudinaryModule], // Import CloudinaryModule to get IUploadService
  controllers: [UploadController],
})
export class UploadModule {}

