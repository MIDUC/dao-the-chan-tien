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

