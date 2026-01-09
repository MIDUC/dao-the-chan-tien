# Hướng dẫn Start Backend

## Cách 1: Chạy từ thư mục backend

```bash
cd backend
npm run start:dev
```

Bạn sẽ thấy log:
```
🚀 Backend server running on http://localhost:3000
```

## Cách 2: Chạy từ root (nếu đã cài concurrently)

```bash
npm run dev:be
```

## Kiểm tra Backend đã chạy:

1. Mở browser và truy cập: `http://localhost:3000`
2. Hoặc test API: `http://localhost:3000/auth/login` (sẽ trả về 400 vì thiếu body, nhưng chứng tỏ server đang chạy)

## Lỗi thường gặp:

### Lỗi kết nối database:
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra username/password trong `backend/src/config/database.config.ts`
- Đảm bảo database `dao_the_chan_tien` đã được tạo

### Port 3000 đã được dùng:
- Tìm process đang dùng port 3000 và kill nó
- Hoặc đổi port trong `backend/src/main.ts`

