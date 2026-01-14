import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ItemEffect } from './item-effect.entity';

export enum ItemType {
  CONSUMABLE = 'consumable', // Vật phẩm tiêu hao (thuốc, đan dược)
  EQUIPMENT = 'equipment', // Trang bị
  MATERIAL = 'material', // Nguyên liệu (luyện đan, luyện khí)
  QUEST_ITEM = 'quest_item', // Vật phẩm nhiệm vụ
  SPECIAL = 'special', // Vật phẩm đặc biệt
}

export enum ItemRarity {
  COMMON = 'common', // Thường
  UNCOMMON = 'uncommon', // Không thường
  RARE = 'rare', // Hiếm
  EPIC = 'epic', // Sử thi
  LEGENDARY = 'legendary', // Huyền thoại
  MYTHIC = 'mythic', // Thần thoại
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ItemType,
  })
  item_type: ItemType;

  // Category - phân loại chi tiết (ví dụ: 'herb_common', 'herb_rare', 'weapon_sword', 'weapon_staff')
  @Column({ nullable: true })
  category: string;

  // Grade/Tier - phẩm cấp (1-10 hoặc hơn, số càng cao càng tốt)
  @Column({ default: 1 })
  grade: number;

  @Column({
    type: 'enum',
    enum: ItemRarity,
    default: ItemRarity.COMMON,
  })
  rarity: ItemRarity;

  // Icon/Image URL
  @Column({ nullable: true })
  icon_url: string;

  // Stack size (số lượng tối đa có thể xếp chồng)
  @Column({ default: 1 })
  max_stack: number;

  // Có thể bán được không
  @Column({ default: true })
  sellable: boolean;

  // Giá bán (nếu sellable)
  @Column({ default: 0 })
  sell_price: number;

  // Có thể sử dụng được không (cho consumable)
  @Column({ default: false })
  usable: boolean;

  // Equipment slot (nếu là equipment)
  @Column({ nullable: true })
  equipment_slot: string; // 'weapon', 'armor', 'accessory', etc.

  // Stats khi trang bị (JSON) - Base stats (template)
  @Column({ type: 'json', nullable: true })
  equipment_stats: {
    strength?: number;
    agility?: number;
    wisdom?: number;
    hp?: number;
    defense?: number;
  };

  // Base config cho random stats (JSON) - Khoảng random cho equipment
  // Ví dụ: { "strength_min": 40, "strength_max": 60, "agility_min": 20, "agility_max": 50 }
  @Column({ type: 'json', nullable: true })
  base_config: {
    strength_min?: number;
    strength_max?: number;
    agility_min?: number;
    agility_max?: number;
    wisdom_min?: number;
    wisdom_max?: number;
    hp_min?: number;
    hp_max?: number;
    defense_min?: number;
    defense_max?: number;
    can_refine?: boolean;
    can_socket?: boolean;
  };

  // Level requirement để sử dụng/trang bị
  @Column({ default: 1 })
  required_level: number;

  // Ngũ hành + Dị nguyên tố (Element) - Có thể có nhiều loại
  // Ngũ Hành: kim, moc, thuy, hoa, tho
  // Dị Nguyên Tố: loi (Lôi), bang (Băng), quang (Quang), am (Ám), phong (Phong), doc (Độc), thien (Thiên), dia (Địa)
  @Column({ type: 'json', nullable: true })
  element:
    | (
        | 'kim' // Kim (Metal)
        | 'moc' // Mộc (Wood)
        | 'thuy' // Thủy (Water)
        | 'hoa' // Hỏa (Fire)
        | 'tho' // Thổ (Earth)
        | 'loi' // Lôi (Thunder/Lightning)
        | 'bang' // Băng (Ice)
        | 'quang' // Quang (Light)
        | 'am' // Ám (Dark/Shadow)
        | 'phong' // Phong (Wind)
        | 'doc' // Độc (Poison)
        | 'thien' // Thiên (Sky/Heaven)
        | 'dia' // Địa (Earth - khác với Thổ)
      )[]
    | null;

  // Qi bonus khi trang bị (JSON)
  @Column({ type: 'json', nullable: true })
  qi_bonus: {
    qi_type?: string; // QiType
    amount?: number; // Amount of Qi gained when equipped
    per_minute?: number; // Qi regen per minute when equipped
  }[];

  // Effects (Tác dụng) cho Cổ Bảo - Buffs khi trang bị
  @Column({ type: 'json', nullable: true })
  artifact_effects: {
    attack_bonus?: number; // Tăng tấn công
    defense_bonus?: number; // Tăng phòng thủ
    hp_bonus?: number; // Tăng HP
    mp_bonus?: number; // Tăng MP
    crit_chance?: number; // Tăng tỷ lệ bạo kích
    crit_damage?: number; // Tăng sát thương bạo kích
    speed_bonus?: number; // Tăng tốc độ
    dodge_chance?: number; // Tăng tỷ lệ né tránh
    exp_bonus?: number; // Tăng EXP gain
    drop_rate_bonus?: number; // Tăng tỷ lệ rơi đồ
    [key: string]: any;
  };

  // Penalties (Tác hại) cho Cổ Bảo - Debuffs khi trang bị
  @Column({ type: 'json', nullable: true })
  artifact_penalties: {
    hp_loss_per_attack?: number; // Mất máu mỗi lần tấn công
    mp_loss_per_skill?: number; // Mất MP mỗi lần dùng skill
    hp_drain_per_second?: number; // Mất máu mỗi giây
    mp_drain_per_second?: number; // Mất MP mỗi giây
    defense_reduction?: number; // Giảm phòng thủ
    speed_reduction?: number; // Giảm tốc độ
    exp_reduction?: number; // Giảm EXP gain
    stat_reduction?: {
      strength?: number;
      agility?: number;
      wisdom?: number;
    };
    [key: string]: any;
  };

  // Realm requirement (realm_level)
  @Column({ default: 1 })
  required_realm_level: number;

  @OneToMany(() => ItemEffect, (effect) => effect.item)
  effects: ItemEffect[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
