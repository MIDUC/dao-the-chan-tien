import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  IUploadService,
  UploadOptions,
  UploadResult,
} from './interfaces/upload-service.interface';

/**
 * Local file storage service implementation
 * This is an example of how to implement IUploadService for local storage
 * You can switch to this by changing the provider in CloudinaryModule
 * 
 * Usage: Change CloudinaryModule provider to:
 * {
 *   provide: 'IUploadService',
 *   useClass: LocalStorageService,
 * }
 */
@Injectable()
export class LocalStorageService implements IUploadService {
  private readonly uploadDir: string;

  constructor() {
    // Use environment variable or default to 'public/uploads'
    this.uploadDir =
      process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads');

    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    options?: UploadOptions,
  ): Promise<UploadResult> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.originalname.split('.').pop() || 'bin';
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Determine folder path
    const folder = options?.folder || 'default';
    const folderPath = join(this.uploadDir, folder);

    // Ensure folder exists
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true });
    }

    // Write file to disk
    const filePath = join(folderPath, filename);
    await writeFile(filePath, file.buffer);

    // Generate public URL
    // In production, this should be your domain + path
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/${folder}/${filename}`;

    return {
      url,
      secureUrl: url, // Same as url for local storage
      publicId: `${folder}/${filename}`, // Path relative to uploadDir
      format: extension,
      bytes: file.buffer.length,
    };
  }
}

