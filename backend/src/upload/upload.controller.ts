import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('item')
  @UseInterceptors(FileInterceptor('file')) // Chú ý: Key gửi lên phải tên là 'file'
  async uploadImage(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    const result = await this.cloudinaryService.uploadFile(file);
    return {
      url: result.secure_url, // Link ảnh HTTPS
      public_id: result.public_id,
    };
  }
}
