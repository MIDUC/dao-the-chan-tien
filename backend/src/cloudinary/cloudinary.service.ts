import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
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

  uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      // Check if Cloudinary is configured
      const config = cloudinary.config();
      if (!config.cloud_name || !config.api_key || !config.api_secret) {
        return reject(new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'));
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || 'tu-tien-game', // Ảnh sẽ chui vào thư mục này trên cloud
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Upload failed: no result'));
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
