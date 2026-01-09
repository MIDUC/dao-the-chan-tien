# 🚀 Quick Start Guide

## Bước 1: Kiểm tra Backend

Mở terminal và chạy:

```bash
cd backend
npm run start:dev
```

Đợi đến khi thấy:
```
[Nest] ... Application is running on: http://localhost:3000
```

## Bước 2: Seed Database

Mở terminal MỚI (giữ backend đang chạy):

```bash
cd backend
npm run seed
```

Bạn sẽ thấy:
```
✅ Database connected
🧹 Cleared existing data
✅ Created 2 users
✅ Created 4 roles
...
🎉 Seed completed successfully!
```

## Bước 3: Chạy Frontend

Mở terminal MỚI (giữ backend đang chạy):

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## Bước 4: Kiểm tra

1. Mở browser: `http://localhost:5173`
2. Mở DevTools (F12) → Console tab
3. Kiểm tra có lỗi không

### Nếu vẫn thấy "Chưa tìm thấy Đạo hữu":

1. **Kiểm tra Backend có chạy không:**
   - Mở: `http://localhost:3000/users`
   - Phải thấy JSON data

2. **Kiểm tra Database:**
   ```bash
   cd backend
   npm run seed
   ```

3. **Kiểm tra Console (F12):**
   - Xem có lỗi CORS không
   - Xem API response như thế nào

## Troubleshooting

### Backend không chạy
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra port 3000 có bị chiếm không
- Xem log trong terminal backend

### Database lỗi
- Tạo database: `CREATE DATABASE dao_the_chan_tien;`
- Kiểm tra password trong `backend/src/config/database.config.ts`

### Frontend không kết nối được
- Kiểm tra backend đang chạy ở `http://localhost:3000`
- Kiểm tra CORS đã enable trong `backend/src/main.ts`

