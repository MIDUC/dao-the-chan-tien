import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'drji3dqcm', // Tên cloud của bạn (tôi lấy từ ảnh cũ)
      api_key: 'DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY',
      api_secret: 'DÁN_API_SECRET_CỦA_BẠN_VÀO_ĐÂY',
    });
  },
};
