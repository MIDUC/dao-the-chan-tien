# Upload Service Module

Module này được thiết kế theo **Interface/Adapter Pattern** để dễ dàng chuyển đổi giữa các storage providers (Cloudinary, S3, Local Storage, etc.) mà không cần sửa code ở các module khác.

## Cấu trúc

```
upload/
├── interfaces/
│   └── upload-service.interface.ts  # Interface định nghĩa contract
├── local-storage.service.ts         # Implementation cho local storage
└── README.md                        # Documentation này
```

## Cách hoạt động

1. **Interface** (`IUploadService`): Định nghĩa contract chung cho tất cả upload services
2. **Implementations**: 
   - `CloudinaryService`: Upload lên Cloudinary (hiện tại đang dùng)
   - `LocalStorageService`: Lưu file local (ví dụ)
3. **Dependency Injection**: NestJS inject interface thay vì concrete class

## Chuyển đổi giữa các providers

### Hiện tại: Cloudinary (mặc định)

```typescript
// cloudinary.module.ts
{
  provide: 'IUploadService',
  useClass: CloudinaryService,
}
```

### Chuyển sang Local Storage

1. Cập nhật `CloudinaryModule`:

```typescript
import { LocalStorageService } from '../upload/local-storage.service';

@Module({
  providers: [
    {
      provide: 'IUploadService',
      useClass: LocalStorageService, // Thay đổi ở đây
    },
  ],
  // ...
})
```

2. Set environment variable:
```env
UPLOAD_DIR=./public/uploads
BASE_URL=http://localhost:3000
```

### Chuyển sang AWS S3

1. Tạo `S3StorageService` implement `IUploadService`:

```typescript
@Injectable()
export class S3StorageService implements IUploadService {
  async uploadFile(file, options?): Promise<UploadResult> {
    // S3 upload logic
  }
}
```

2. Cập nhật module provider:
```typescript
{
  provide: 'IUploadService',
  useClass: S3StorageService,
}
```

## Sử dụng trong code

### Trong Controller/Service

```typescript
import { Inject } from '@nestjs/common';
import { IUploadService } from './interfaces/upload-service.interface';

@Injectable()
export class MyService {
  constructor(
    @Inject('IUploadService')
    private readonly uploadService: IUploadService,
  ) {}

  async uploadAvatar(file) {
    const result = await this.uploadService.uploadFile(file, {
      folder: 'avatars',
    });
    return result.url;
  }
}
```

## Lợi ích

✅ **Flexibility**: Dễ dàng chuyển đổi storage provider  
✅ **Testability**: Có thể mock interface trong tests  
✅ **Maintainability**: Code không phụ thuộc vào implementation cụ thể  
✅ **Scalability**: Thêm provider mới không cần sửa code cũ  

## Best Practices

1. **Luôn inject interface**, không inject concrete class
2. **Sử dụng options** để customize upload behavior
3. **Handle errors** properly trong implementation
4. **Log upload activities** để debug

