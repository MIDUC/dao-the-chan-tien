import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { IUploadService } from './interfaces/upload-service.interface';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    @Inject('IUploadService')
    private readonly uploadService: IUploadService,
  ) {}

  @Post('item')
  @UseInterceptors(FileInterceptor('file')) // Chú ý: Key gửi lên phải tên là 'file'
  async uploadImage(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      console.log('Upload request received:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.buffer.length,
      });

      const result = await this.uploadService.uploadFile(file, {
        folder: 'tu-tien-game', // Can be made configurable
      });

      console.log('Upload successful:', {
        url: result.url,
        publicId: result.publicId,
      });

      return {
        url: result.url || result.secureUrl, // Link ảnh HTTPS
        public_id: result.publicId,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }
}
