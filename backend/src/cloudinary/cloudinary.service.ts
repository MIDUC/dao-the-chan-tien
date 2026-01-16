import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import {
  IUploadService,
  UploadOptions,
  UploadResult,
} from '../upload/interfaces/upload-service.interface';

@Injectable()
export class CloudinaryService implements IUploadService {
  constructor() {
    // Ensure Cloudinary is configured
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        console.error('⚠️  Cloudinary credentials not found in environment variables!');
        console.error('Please set the following environment variables:');
        console.error('  - CLOUDINARY_CLOUD_NAME');
        console.error('  - CLOUDINARY_API_KEY');
        console.error('  - CLOUDINARY_API_SECRET');
        throw new Error('Cloudinary credentials are required. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
      }

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  /**
   * Upload file to Cloudinary
   * Implements IUploadService interface
   */
  async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    options?: UploadOptions,
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      // Check if Cloudinary is configured
      const config = cloudinary.config();
      if (!config.cloud_name || !config.api_key || !config.api_secret) {
        return reject(
          new Error(
            'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
          ),
        );
      }

      const uploadOptions: any = {
        folder: options?.folder || process.env.CLOUDINARY_FOLDER || 'tu-tien-game',
        overwrite: options?.overwrite ?? false,
      };

      if (options?.publicId) {
        uploadOptions.public_id = options.publicId;
      }

      if (options?.transformation) {
        uploadOptions.transformation = options.transformation;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Upload failed: no result'));
          }

          // Map Cloudinary response to UploadResult interface
          const uploadResult: UploadResult = {
            url: result.secure_url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          };

          resolve(uploadResult);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
