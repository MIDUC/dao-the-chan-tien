import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

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

      const result = await this.cloudinaryService.uploadFile(file);
      
      console.log('Upload successful:', {
        url: result.secure_url,
        public_id: result.public_id,
      });

      return {
        url: result.secure_url, // Link ảnh HTTPS
        public_id: result.public_id,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }
}
