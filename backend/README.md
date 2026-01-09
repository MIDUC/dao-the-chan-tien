# Đạo Thể Chân Tiên - Backend API

Game web tu tiên kết hợp fitness gamification - Backend NestJS

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Công nghệ](#công-nghệ)
- [Database Schema](#database-schema)
- [Tính năng](#tính-năng)
- [API Endpoints](#api-endpoints)
- [Setup](#setup)

## 🎮 Tổng quan

Game tu tiên màn hình dọc, kết hợp nhiệm vụ đời thực (fitness) với gameplay RPG. Người chơi tu luyện, hoàn thành quest, và tương tác với cộng đồng.

## 🛠 Công nghệ

- **Framework**: NestJS
- **Database**: MySQL + TypeORM
- **Language**: TypeScript
- **Architecture**: RESTful API + WebSocket (future)

## 📊 Database Schema

### Core Entities

#### User & Character
- `users` - Tài khoản người chơi
- `characters` - Nhân vật trong game
- `roles` - Vai trò (admin, player, vip, moderator)
- `user_roles` - Quan hệ many-to-many User-Role

#### NPC & Quest System
- `npcs` - NPC giao nhiệm vụ
- `quests` - Nhiệm vụ (push_up, running, meditation, combat)
- `character_quests` - Nhiệm vụ người chơi đã nhận

#### Item System
- `items` - Vật phẩm (consumable, equipment, material, quest_item, special)
  - Phân loại: `category` (herb_common, weapon_sword, etc.)
  - Phẩm cấp: `grade` (1-10)
  - Độ hiếm: `rarity` (common → mythic)
- `item_effects` - Tác dụng của item (heal, buff, exp_boost, etc.)
- `inventory` - Túi đồ của character
- `equipment` - Trang bị (weapon, armor, helmet, boots, accessories, rings, necklace)

### Gameplay Features

#### Currency System
- `currency` - Tiền tệ
  - `ling_stone` - Linh Thạch (tiền chính)
  - `merit_point` - Công Đức (từ quest/events)
  - `essence` - Tinh Hoa (premium currency)

#### Achievement System
- `achievements` - Thành tựu
  - Types: quest, realm, checkin, combat, social, collection, exploration
- `character_achievements` - Thành tựu người chơi đã đạt

#### Shop & Trading
- `shops` - Cửa hàng (NPC, Player Market, Guild, Event)
- `shop_items` - Items trong shop
- `transactions` - Lịch sử giao dịch (buy, sell, trade, gift)

#### Skill System
- `skills` - Kỹ năng
  - Types: passive, active, ultimate
  - Categories: combat, cultivation, crafting, social
- `character_skills` - Kỹ năng người chơi đã học

#### Leaderboard
- `leaderboards` - Bảng xếp hạng
  - Types: realm_level, exp, quest_completed, checkin_streak, combat_wins, achievement_count
  - Periods: daily, weekly, monthly, all_time

#### Social Features
- `friends` - Hệ thống bạn bè (pending, accepted, blocked)
- `notifications` - Thông báo
  - Types: quest_deadline, event_start, friend_request, achievement, gift_received, guild_invite, system
- `guilds` - Bang hội
- `guild_members` - Thành viên bang hội (leader, officer, elder, member)

#### Battle System
- `battle_logs` - Lịch sử chiến đấu
  - Types: PVE, PVP, boss, arena
  - Results: win, lose, draw

### Future Features (Entities đã tạo)

#### Daily Check-in
- `daily_checkins` - Điểm danh hàng ngày
  - Consecutive days tracking
  - Rewards system

#### Events
- `events` - Sự kiện (daily, weekly, limited, seasonal, special)
- `character_events` - Người chơi tham gia sự kiện

#### Alchemy
- `alchemy` - Luyện đan
  - Recipe system
  - Materials & results
  - Duration tracking

#### Cultivation
- `cultivation` - Luyện khí
  - Types: meditation, breathing, body_training, spiritual
  - EXP & spirit gain

#### Pets
- `pets` - Thú cưng
  - Rarity system
  - Level & stats
- `pet_skills` - Kỹ năng của pet

#### Party
- `parties` - Đội nhóm
- `party_members` - Thành viên đội (leader, member, officer)

## ✨ Tính năng

### ✅ Đã implement

- [x] User & Character management
- [x] Role system (multi-role per user)
- [x] NPC & Quest system
- [x] Item system với category & grade
- [x] Inventory & Equipment
- [x] Realm progression (Luyện Khí → Trúc Cơ → ...)

### 🚧 Đã thiết kế, chưa implement logic

- [ ] Currency system
- [ ] Achievement system
- [ ] Shop & Marketplace
- [ ] Skill/Talent tree
- [ ] Leaderboard
- [ ] Friend system
- [ ] Notification system
- [ ] Guild/Clan system
- [ ] Battle system
- [ ] Daily check-in
- [ ] Events
- [ ] Alchemy
- [ ] Cultivation
- [ ] Pets
- [ ] Party system

## 🔌 API Endpoints

### Users
- `GET /users` - Lấy tất cả users
- `GET /users/:id` - Lấy user theo ID

### Characters
- `GET /characters` - Lấy tất cả characters
- `GET /characters/:id` - Lấy character theo ID
- `GET /characters/user/:userId` - Lấy characters của user

### NPCs
- `GET /npcs` - Lấy tất cả NPCs
- `GET /npcs/:id` - Lấy NPC theo ID
- `GET /npcs/:id/quests` - Lấy quests của NPC

### Roles
- `GET /roles` - Lấy tất cả roles
- `GET /roles/:id` - Lấy role theo ID
- `POST /roles/assign` - Gán roles cho user
- `DELETE /roles/user/:userId/role/:roleId` - Xóa role khỏi user
- `GET /roles/user/:userId/has-role/:roleName` - Check user có role không
- `GET /roles/user/:userId/highest` - Lấy role cao nhất của user

## 🚀 Setup

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm hoặc yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```sql
CREATE DATABASE dao_the_chan_tien;
```

3. Configure database (optional - edit `src/config/database.config.ts`):
```typescript
// Hoặc dùng environment variables:
// DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
```

4. Run seed script:
```bash
npm run seed
```

5. Start development server:
```bash
npm run start:dev
```

Server sẽ chạy tại `http://localhost:3000`

## 📝 Notes

### Realm System
- Mỗi cảnh giới có 10 tầng
- Luyện Khí: level 1-10
- Trúc Cơ: level 11-20
- Kim Đan: level 21-30
- ... (xem `src/utils/realm.util.ts`)

### Item System
- Items có `category` để phân loại chi tiết
- Items có `grade` (1-10) để phân cấp
- Items có `rarity` (common → mythic)

### Database Design
- Sử dụng JSON fields cho flexible config
- Foreign keys được setup đầy đủ
- Indexes sẽ được thêm khi cần optimize

## 🔮 Roadmap

### Phase 1 - MVP (Current)
- ✅ Basic character system
- ✅ Quest system
- ✅ Item & Inventory
- ⏳ NPC interaction UI
- ⏳ Quest completion logic

### Phase 2
- Currency & Shop
- Achievement system
- Skill tree
- Leaderboard
- Friend system

### Phase 3
- Guild system
- Battle system
- Events
- Alchemy & Cultivation
- Pets

### Phase 4
- PvP Arena
- Guild Wars
- Advanced crafting
- Map & Location
- Monetization

## 📄 License

Private project
