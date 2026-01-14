import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
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

    return cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  },
};
