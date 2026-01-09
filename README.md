# Đạo Thể Chân Tiên

Game web tu tiên kết hợp fitness gamification

## 🚀 Cách chạy dự án

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm hoặc yarn

### Bước 1: Setup Database

1. Tạo database MySQL:

```sql
CREATE DATABASE dao_the_chan_tien;
```

2. Cấu hình database (nếu cần):
   - Mở `backend/src/config/database.config.ts`
   - Hoặc set environment variables:
     - `DB_HOST` (default: localhost)
     - `DB_PORT` (default: 3306)
     - `DB_USERNAME` (default: root)
     - `DB_PASSWORD` (default: mypassword)
     - `DB_DATABASE` (default: dao_the_chan_tien)

### Bước 2: Setup Backend

```bash
cd backend
npm install
npm run seed
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`

**⚠️ QUAN TRỌNG: Backend PHẢI chạy trước khi mở frontend!**

**Kiểm tra backend đã chạy:**

- Xem terminal có log: `🚀 Backend server running on http://localhost:3000`
- Mở browser và truy cập: `http://localhost:3000` (nếu thấy response = backend đang chạy ✅)

**Nếu gặp lỗi "Network Error":**

1. Backend chưa chạy → Chạy `cd backend && npm run start:dev`
2. MySQL chưa chạy → Start MySQL service
3. Database chưa tạo → Chạy `npm run seed` trong thư mục backend
4. Xem file `START_BACKEND.md` để biết thêm chi tiết

**Lưu ý:** Sau khi chạy `npm run seed`, bạn sẽ có tài khoản admin mặc định:

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@example.com`

Tài khoản này có quyền admin và có thể truy cập Admin Panel để quản lý users, items, NPCs, quests, roles, v.v.

### Bước 3: Setup Frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác nếu 5173 đã được dùng)

### Bước 4: Chạy cả 2 cùng lúc (từ root)

```bash
npm install
npm run dev
```

## 📁 Cấu trúc dự án

```
dao-the-chan-tien/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── entities/     # Database entities
│   │   ├── modules/      # Feature modules
│   │   └── config/       # Configuration
│   └── package.json
├── frontend/         # Vue 3 Frontend
│   ├── src/
│   │   ├── components/   # Vue components
│   │   ├── composables/ # Composables
│   │   └── utils/        # Utilities
│   └── package.json
└── package.json      # Root package (monorepo)
```

## 🎮 Tính năng

### ✅ Đã implement

- User & Character management
- Role system
- NPC & Quest system
- Item system (Inventory, Equipment)
- Currency system
- Achievement system
- Shop & Trading
- Skill system
- Leaderboard
- Friend system
- Notification system

### 🚧 Đã thiết kế, chưa implement logic

- Daily check-in
- Events
- Alchemy
- Cultivation
- Pets
- Party/Guild
- Battle system

## 🔌 API Endpoints

Xem chi tiết trong `backend/README.md`

## 🐛 Troubleshooting

### Lỗi kết nối database

- Kiểm tra MySQL đã chạy chưa
- Kiểm tra username/password trong `database.config.ts`
- Đảm bảo database đã được tạo

### Lỗi CORS

- Backend đã enable CORS, nếu vẫn lỗi kiểm tra port frontend

### Lỗi seed

- Đảm bảo database đã được tạo
- Kiểm tra MySQL connection
- Xóa database và tạo lại nếu cần

## 📝 Notes

- Backend: NestJS + TypeORM + MySQL
- Frontend: Vue 3 + Vite + TailwindCSS
- Mobile-first design
- Màn hình dọc (portrait)
