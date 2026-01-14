# Hệ Thống Khí (Qi System) - Tài Liệu Tham Khảo

## 📋 Mục Lục

1. [Các Loại Khí (Qi Types)](#các-loại-khí-qi-types)
2. [Ngũ Hành (Elements)](#ngũ-hành-elements)
3. [Chỉ Số Cơ Bản (Primary Stats)](#chỉ-số-cơ-bản-primary-stats)
4. [Chỉ Số Thực Chiến (Combat Stats)](#chỉ-số-thực-chiến-combat-stats)
5. [Chỉ Số Tiên Thiên (Hidden Stats)](#chỉ-số-tiên-thiên-hidden-stats)
6. [Mapping & Tương Quan](#mapping--tương-quan)

---

## Các Loại Khí (Qi Types)

### Nhóm Tâm Tính & Hành Vi (Core Gameplay)

#### 1. Sát Khí (Killing Qi)

- **Tên biến**: `KILLING_QI`
- **Category**: `CORE_GAMEPLAY`
- **Nguồn gốc**:
  - Game: Tiêu diệt quái vật, PvP thắng
  - Đời thực: HIIT, Boxing
- **Tác dụng (Lợi)**:
  - Tăng % sát thương đầu ra
  - Tăng Bạo Kích (Crit rate)
  - Gây hiệu ứng Áp Chế (quái yếu bỏ chạy)
- **Tác hại (Rủi ro)**:
  - Nuôi Tâm Ma (Boss Tâm Ma mạnh hơn khi đột phá)
  - Mất kiểm soát (tự tấn công bản thân nếu Tâm Cảnh thấp)
  - NPC Chính phái từ chối giao dịch
  - Giá mua đồ đắt hơn

#### 2. Văn Khí (Scholarly Qi)

- **Tên biến**: `SCHOLARLY_QI`
- **Category**: `CORE_GAMEPLAY`
- **Nguồn gốc**:
  - Game: Bí cảnh Thư viện, Giải đố, Sưu tầm sách
  - Đời thực: Học tập, Đọc sách, Giải toán
- **Tác dụng (Lợi)**:
  - Không có tác hại (Pure Buff)
  - Nhìn thấu (hiển thị HP và điểm yếu đối thủ)
  - Giảm thời gian hồi chiêu (Cooldown Reduction)
  - Giảm tiêu hao năng lượng (Mana cost)
  - Tăng tỷ lệ thành công rèn đồ/chế thuốc
- **Hạn chế**: Tốc độ kiếm được rất chậm

#### 3. Hạo Nhiên Khí (Righteous Qi)

- **Tên biến**: `RIGHTEOUS_QI`
- **Category**: `CORE_GAMEPLAY`
- **Nguồn gốc**:
  - Game: Nhiệm vụ bảo vệ, Donate bang hội, Tiêu diệt quái Tà đạo
  - Đời thực: Dậy sớm, Duy trì chuỗi tập luyện
- **Tác dụng (Lợi)**:
  - Khắc chế Tâm Ma
  - Hộ Thể (tạo giáp ảo)
  - Kháng hiệu ứng (giảm Choáng, Trói, Hoảng sợ)
- **Tác hại (Rủi ro)**:
  - Phản phệ: Nếu PK giết người vô tội → Khí tự hủy và gây sát thương ngược

---

### Nhóm Thể Chất & Sinh Tồn (Fitness)

#### 4. Huyết Khí (Blood Qi)

- **Tên biến**: `BLOOD_QI`
- **Category**: `FITNESS`
- **Nguồn gốc**: Các bài tập sức mạnh (Gym, Squat, Push-up)
- **Tác dụng (Lợi)**:
  - Tăng giới hạn Máu (HP)
  - Tăng tốc độ hồi phục máu tự nhiên
  - Tăng khả năng mang vác (Inventory weight)
- **Tác hại (Rủi ro)**:
  - Nếu Huyết Khí quá cao mà Linh Khí quá thấp → Giảm kháng phép, dễ bị dính hiệu ứng phép thuật

#### 5. Trọc Khí (Turbid Qi)

- **Tên biến**: `IMPURE_QI`
- **Category**: `FITNESS`
- **Nguồn gốc**:
  - Đời thực: Penalty khi lười tập (không log 24h/48h)
  - Game: Sử dụng thuốc lắc (Doping) quá liều
- **Tác dụng**: Không có lợi ích (khí rác)
- **Tác hại**:
  - Làm chậm tốc độ nhận EXP
  - Chiếm chỗ trong bể chứa năng lượng (giảm Max Mana)
- **Cách loại bỏ**: Phải tập thể dục để "bài tiết"

#### 6. Linh Khí (Spiritual Qi)

- **Tên biến**: `SPIRITUAL_QI`
- **Category**: `FITNESS`
- **Nguồn gốc**: Thiền, Yoga, Ngủ đủ giấc
- **Tác dụng (Lợi)**:
  - Tăng giới hạn Năng lượng (Mana)
  - Tăng sức mạnh kỹ năng phép thuật/triệu hồi
- **Rủi ro**: Thu hút quái vật "Phệ Linh" (chuyên hút mana) tấn công ưu tiên

---

### Nhóm Đặc Biệt & Ẩn (Rare)

#### 7. Oán Khí (Resentment Qi)

- **Tên biến**: `RESENTMENT_QI`
- **Category**: `RARE`
- **Nguồn gốc**:
  - Khi nhân vật bị người chơi khác giết chết
  - Đi vào các vùng đất chết (Nghĩa địa)
- **Tác dụng (Lợi)**:
  - Kích hoạt trạng thái "Báo Thù": Tăng 200% sát thương lên kẻ vừa giết mình trong 1 giờ
  - Dùng để luyện các bí kíp tà môn
- **Tác hại**: Giảm chỉ số may mắn (Phúc Duyên)

#### 8. Mị Khí (Charm Qi)

- **Tên biến**: `CHARM_QI`
- **Category**: `RARE`
- **Nguồn gốc**:
  - Tương tác xã hội (Chat, Kết bạn, Tặng quà)
  - Dùng trang bị thời trang
- **Tác dụng (Lợi)**:
  - Tăng khả năng thu phục NPC hoặc Pet
  - Xác suất khiến quái vật ngần ngại không tấn công lượt đầu tiên
- **Tác hại**: Dễ bị NPC ghen ghét hoặc quái vật giống cái tấn công mạnh hơn

#### 9. Hồng Mông Tử Khí (Grandmist Purple Qi)

- **Tên biến**: `GRANDMIST_PURPLE_QI`
- **Category**: `LEGENDARY`
- **Nguồn gốc**: Cực hiếm. Chỉ xuất hiện khi đăng nhập và tập luyện vào đúng khung giờ **5:00 - 7:00 sáng** (Giờ Mão - Đón bình minh)
- **Tác dụng (Lợi)**:
  - Loại khí cao cấp nhất
  - Có thể chuyển hóa thành bất kỳ loại khí nào khác khi cần
  - Đảm bảo 100% thành công khi rèn đồ Thần khí hoặc Đột phá
  - Dùng để đột phá các cảnh giới đại năng
- **Tác hại**: Không có

#### 10. Tử Khí (Death Qi)

- **Tên biến**: `DEATH_QI`
- **Category**: `RARE`
- **Nguồn gốc**:
  - Tích tụ khi ở gần cái chết hoặc vùng đất chết quá lâu
  - Đi vào các vùng đất chết (Nghĩa địa, Chiến trường)
- **Tác dụng**: Không có lợi ích
- **Tác hại**:
  - Làm chậm tốc độ tu luyện (-30%)
  - Giảm kháng phép và kháng vật lý (-20%)
  - Tụt máu dần dần (0.5 HP/giây)
  - Giảm may mắn (Phúc Duyên -30)

---

### Nhóm Cơ Bản (Basic)

#### 11. Nguyên Khí (Vital Qi)

- **Tên biến**: `VITAL_QI`
- **Category**: `BASIC`
- **Nguồn gốc**: Rất quý, thường là phần thưởng Event lớn hoặc Streak 30 ngày
- **Tác dụng**: Dùng khi đột phá cảnh giới (tăng tỷ lệ thành công) hoặc hồi sinh

---

### Nhóm Nguyên Tố & Môi Trường (Elemental)

#### 12. Hàn Khí (Frost Qi)

- **Tên biến**: `FROST_QI`
- **Category**: `ELEMENTAL`
- **Nguồn gốc**: Tu luyện ở vùng núi tuyết, uống dược liệu tính hàn
- **Tác dụng**: Đòn đánh gây làm chậm (Slow), đóng băng

#### 13. Dương Khí (Yang Qi)

- **Tên biến**: `YANG_QI`
- **Category**: `ELEMENTAL`
- **Nguồn gốc**: Chạy bộ ngoài trời (GPS detect) vào ban ngày
- **Tác dụng**: Tăng khả năng hồi phục, thiêu đốt kẻ địch âm tà

#### 14. Âm Khí (Yin Qi)

- **Tên biến**: `YIN_QI`
- **Category**: `ELEMENTAL`
- **Nguồn gốc**: Tu luyện trong hang động, nghĩa địa
- **Tác dụng**: Tăng khả năng ẩn thân, tấn công linh hồn

---

### Nhóm Cao Cấp & Truyền Thuyết (Legendary)

#### 15. Tiên Thiên Khí (Pre-natal Qi)

- **Tên biến**: `PRENATAL_QI`
- **Category**: `LEGENDARY`
- **Tác dụng**: Cải thiện Căn Cốt vĩnh viễn (Rebirth/Trùng sinh)

#### 16. Hỗn Độn Khí (Chaos Qi)

- **Tên biến**: `CHAOS_QI`
- **Category**: `LEGENDARY`
- **Tác dụng**: Chuyển hóa thành bất kỳ loại sát thương nào kẻ địch yếu nhất

#### 17. Đế Khí (Imperial Qi)

- **Tên biến**: `IMPERIAL_QI`
- **Category**: `LEGENDARY`
- **Tác dụng**: Buff chỉ số cho toàn bộ thành viên trong Bang hội/Party (dành cho Bang chủ)

---

### Nhóm Phòng Thủ & Hỗ Trợ (Defensive)

#### 18. Cương Khí (Aura Qi)

- **Tên biến**: `AURA_QI`
- **Category**: `DEFENSIVE`
- **Tác dụng**: Lớp "Giáp ảo" tự hồi phục sau khi không chịu sát thương trong 5s

#### 19. Thi Khí (Corpse Qi)

- **Tên biến**: `CORPSE_QI`
- **Category**: `DEFENSIVE`
- **Tác dụng**: Ai đánh vào mình sẽ bị nhiễm độc (Phản đòn hệ Độc)

---

## Nguyên Tố (Elements)

### Ngũ Hành (Five Elements)

```typescript
enum NgũHành {
  KIM = 'kim', // Kim (Metal)
  MOC = 'moc', // Mộc (Wood)
  THUY = 'thuy', // Thủy (Water)
  HOA = 'hoa', // Hỏa (Fire)
  THO = 'tho', // Thổ (Earth)
}
```

### Dị Nguyên Tố (Special Elements)

```typescript
enum DịNguyênTố {
  LOI = 'loi', // Lôi (Thunder/Lightning)
  BANG = 'bang', // Băng (Ice)
  QUANG = 'quang', // Quang (Light)
  AM = 'am', // Ám (Dark/Shadow)
  PHONG = 'phong', // Phong (Wind)
  DOC = 'doc', // Độc (Poison)
  THIEN = 'thien', // Thiên (Sky/Heaven)
  DIA = 'dia', // Địa (Earth - khác với Thổ)
}
```

### Tương Quan Ngũ Hành

- **Kim** → Khắc **Mộc** → Khắc **Thổ** → Khắc **Thủy** → Khắc **Hỏa** → Khắc **Kim**
- **Kim** → Sinh **Thủy** → Sinh **Mộc** → Sinh **Hỏa** → Sinh **Thổ** → Sinh **Kim**

### Tương Quan Dị Nguyên Tố

- **Lôi** → Khắc **Băng** → Khắc **Quang** → Khắc **Ám** → Khắc **Lôi**
- **Phong** → Tăng tốc độ di chuyển và né tránh
- **Độc** → Gây sát thương theo thời gian
- **Thiên** → Bonus từ các hoạt động trên cao, bay
- **Địa** → Bonus từ các hoạt động dưới đất, đào bới

### Bonus Theo Linh Căn

#### Ngũ Hành:

- **Kim (Metal)**: Bonus từ strength training (Gym, Weight lifting, Push-up)
- **Mộc (Wood)**: Bonus từ cardio (Running, Jogging, Jump rope)
- **Thủy (Water)**: Bonus từ meditation (Meditation, Yoga, Breathwork)
- **Hỏa (Fire)**: Bonus từ high-intensity (Cardio, HIIT, Sprint)
- **Thổ (Earth)**: Balanced, bonus từ tất cả activities

#### Dị Nguyên Tố:

- **Lôi**: Bonus từ các hoạt động nhanh, bùng nổ (Sprint, HIIT)
- **Băng**: Bonus từ các hoạt động lạnh, bơi lội
- **Quang**: Bonus từ các hoạt động ban ngày, dậy sớm
- **Ám**: Bonus từ các hoạt động ban đêm, thiền định
- **Phong**: Bonus từ các hoạt động ngoài trời, chạy bộ
- **Độc**: Bonus từ các hoạt động độc hại (không khuyến khích)
- **Thiên**: Bonus từ các hoạt động trên cao, leo núi
- **Địa**: Bonus từ các hoạt động dưới đất, đào bới

---

## Chỉ Số Cơ Bản (Primary Stats)

### Tầng Gốc - Gắn liền với Fitness

| Tên Thuộc Tính | Tên Biến    | Hán Việt  | Ý Nghĩa                               | Hành Động Fitness             |
| -------------- | ----------- | --------- | ------------------------------------- | ----------------------------- |
| Sức Mạnh       | `luc_dao`   | Lực Đạo   | Tăng sát thương vật lý, sức mang vác  | Chống đẩy, Kéo xà, Tạ         |
| Thể Chất       | `can_cot`   | Căn Cốt   | Tăng máu tối đa (HP), tăng giáp (Def) | Plank, Squat, Bài tập cơ bụng |
| Nhanh Nhẹn     | `than_phap` | Thân Pháp | Tăng tốc độ đánh, Né tránh, Bạo kích  | Chạy bộ, Nhảy dây, Đi bộ      |
| Trí Tuệ        | `ngo_tinh`  | Ngộ Tính  | Tăng tốc độ tu luyện, lĩnh ngộ bí kíp | Thiền, Tập trung, Đọc sách    |
| Ý Chí          | `dinh_luc`  | Định Lực  | Kháng hiệu ứng xấu, giữ phong độ AFK  | Duy trì chuỗi ngày, Dậy sớm   |

### Mapping Fitness Activities → Primary Stats

```typescript
// Lực Đạo (Sức Mạnh)
PUSH_UP → luc_dao
PULL_UP → luc_dao
WEIGHT_LIFTING → luc_dao
GYM → luc_dao

// Căn Cốt (Thể Chất)
PLANK → can_cot
SQUAT → can_cot
ABS → can_cot
CORE → can_cot

// Thân Pháp (Nhanh Nhẹn)
RUNNING → than_phap
JOGGING → than_phap
JUMP_ROPE → than_phap
WALKING → than_phap

// Ngộ Tính (Trí Tuệ)
MEDITATION → ngo_tinh
FOCUS_TIME → ngo_tinh
READING → ngo_tinh

// Định Lực (Ý Chí)
STREAK → dinh_luc
EARLY_WAKE → dinh_luc
```

---

## Chỉ Số Thực Chiến (Combat Stats)

### Công Thức Tính Toán

Các chỉ số này được **tính toán** từ Tầng Gốc + Trang bị + Cảnh giới (không cho người chơi cộng điểm trực tiếp).

#### Sinh Lực (HP - Health Points)

```
HP = (Căn Cốt * 10) + (Cảnh Giới * 100) + Equipment HP
```

#### Linh Lực (MP - Mana Points)

```
MP = (Ngộ Tính * 10) + (Cảnh Giới * 50)
```

#### Vật Công (Physical Attack)

```
Vật Công = Lực Đạo * 2 + Equipment bonuses
```

#### Pháp Công (Magical Attack)

```
Pháp Công = Ngộ Tính * 2 + Equipment bonuses
```

#### Vật Phòng (Physical Defense)

```
Vật Phòng = Căn Cốt * 1.5 + Equipment Defense
```

#### Pháp Phòng (Magical Defense)

```
Pháp Phòng = Ngộ Tính * 1.5 + Equipment bonuses
```

#### Bạo Kích (Critical Chance)

```
Bạo Kích = Thân Pháp * 0.5% (max 50%)
```

#### Tốc Độ (Speed)

```
Tốc Độ = Thân Pháp * 2 (quyết định ai đánh trước)
```

#### Né Tránh (Dodge)

```
Né Tránh = Thân Pháp * 0.3% (max 30%)
```

---

## Chỉ Số Tiên Thiên (Hidden Stats)

### Linh Căn (Spirit Root)

- **Tên biến**: `linh_can`
- **Type**: `'kim' | 'moc' | 'thuy' | 'hoa' | 'tho'`
- **Ý nghĩa**: Quyết định hệ nguyên tố của nhân vật
- **Tác dụng**:
  - Người có Hỏa Linh Căn khi tập Cardio sẽ nhận nhiều EXP hơn người Thủy Linh Căn
  - Ảnh hưởng đến bonus từ activities

### Phúc Duyên (Luck)

- **Tên biến**: `phuc_duyen`
- **Type**: `number` (0-100)
- **Ý nghĩa**: Tỷ lệ rơi đồ xịn, gặp kỳ ngộ
- **Đặc điểm**: Chỉ số ẩn (Hidden stat), người chơi chỉ cảm nhận được

### Tâm Cảnh (State of Mind)

- **Tên biến**: `tam_canh`
- **Type**: `number` (0-100)
- **Ý nghĩa**: Tiến độ kiểm soát sức mạnh
- **Cơ chế**:
  - Nếu EXP Cảnh giới cao mà Tâm Cảnh thấp → Dễ bị **Tẩu Hỏa Nhập Ma** (Debuff giảm chỉ số)
  - Nếu Tâm Cảnh < 30 và có Sát Khí cao → Có tỷ lệ tự tấn công bản thân

---

## Mapping & Tương Quan

### Fitness Activities → Qi Types

```typescript
// Huyết Khí
gym → BLOOD_QI
weight_lifting → BLOOD_QI
squat → BLOOD_QI
push_up → BLOOD_QI

// Linh Khí
meditation → SPIRITUAL_QI
yoga → SPIRITUAL_QI
breathwork → SPIRITUAL_QI
sleep → SPIRITUAL_QI

// Sát Khí
hiit → KILLING_QI
boxing → KILLING_QI

// Văn Khí
reading → SCHOLARLY_QI
study → SCHOLARLY_QI
focus_time → SCHOLARLY_QI

// Hạo Nhiên Khí
early_wake → RIGHTEOUS_QI
streak → RIGHTEOUS_QI

// Hồng Mông Tử Khí (cực hiếm - có lợi)
early_wake (5:00-7:00 AM) → GRANDMIST_PURPLE_QI

// Tử Khí (có hại)
graveyard → DEATH_QI
battlefield → DEATH_QI
near_death → DEATH_QI
```

### Quest Types → Qi Types

```typescript
kill_monster → KILLING_QI
pvp_win → KILLING_QI
pvp_death → RESENTMENT_QI
help_npc → RIGHTEOUS_QI
protect → RIGHTEOUS_QI
library → SCHOLARLY_QI
puzzle → SCHOLARLY_QI
social → CHARM_QI
gift → CHARM_QI
```

### Equipment Element → Linh Căn Bonus

Khi trang bị có element khớp với linh căn:

- **Bonus**: +20% stats từ equipment
- **Qi Bonus**: Tăng tốc độ tích lũy khí tương ứng

Ví dụ:

- Nhân vật có **Hỏa Linh Căn** trang bị **Hỏa Kiếm** → +20% stats, tăng tích lũy Dương Khí

---

## Tóm Tắt Enum & Constants

### QiType Enum

```typescript
enum QiType {
  // Core Gameplay
  KILLING_QI = 'killing_qi',
  SCHOLARLY_QI = 'scholarly_qi',
  RIGHTEOUS_QI = 'righteous_qi',

  // Fitness
  BLOOD_QI = 'blood_qi',
  SPIRITUAL_QI = 'spiritual_qi',
  IMPURE_QI = 'impure_qi',

  // Rare
  RESENTMENT_QI = 'resentment_qi',
  CHARM_QI = 'charm_qi',
  DEATH_QI = 'death_qi', // Tử Khí (có hại)

  // Basic
  VITAL_QI = 'vital_qi',

  // Elemental
  FROST_QI = 'frost_qi',
  YANG_QI = 'yang_qi',
  YIN_QI = 'yin_qi',

  // Legendary
  PRENATAL_QI = 'prenatal_qi',
  GRANDMIST_PURPLE_QI = 'grandmist_purple_qi', // Hồng Mông Tử Khí (có lợi)
  CHAOS_QI = 'chaos_qi',
  IMPERIAL_QI = 'imperial_qi',

  // Defensive
  AURA_QI = 'aura_qi',
  CORPSE_QI = 'corpse_qi',
}
```

### QiCategory Enum

```typescript
enum QiCategory {
  CORE_GAMEPLAY = 'core_gameplay',
  FITNESS = 'fitness',
  RARE = 'rare',
  BASIC = 'basic',
  ELEMENTAL = 'elemental',
  LEGENDARY = 'legendary',
  DEFENSIVE = 'defensive',
}
```

### Element Enum

```typescript
enum Element {
  KIM = 'kim',
  MOC = 'moc',
  THUY = 'thuy',
  HOA = 'hoa',
  THO = 'tho',
  NONE = 'none',
}
```

### Primary Stats Interface

```typescript
interface PrimaryStats {
  luc_dao: number; // Lực Đạo
  can_cot: number; // Căn Cốt
  than_phap: number; // Thân Pháp
  ngo_tinh: number; // Ngộ Tính
  dinh_luc: number; // Định Lực
}
```

### Hidden Stats Interface

```typescript
interface HiddenStats {
  linh_can: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
  phuc_duyen: number; // 0-100
  tam_canh: number; // 0-100
}
```

---

## Lưu Ý Quan Trọng

1. **Tẩu Hỏa Nhập Ma**: Xảy ra khi EXP cao nhưng Tâm Cảnh thấp (< 30)
2. **Phản Phệ**: Hạo Nhiên Khí sẽ tự hủy nếu PK giết người vô tội
3. **Hồng Mông Tử Khí**: Chỉ có thể kiếm được từ 5:00-7:00 sáng (có lợi)
4. **Tử Khí**: Tích tụ khi ở vùng đất chết quá lâu (có hại)
5. **Trọc Khí**: Tích tụ tự động nếu không log hoạt động 24h
6. **Element Matching**: Trang bị có element khớp với linh căn → Bonus 20%

---

**Cập nhật lần cuối**: 2024
