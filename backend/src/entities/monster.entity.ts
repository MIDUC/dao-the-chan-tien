import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MonsterSkill } from './monster-skill.entity';

export enum MonsterType {
  BEAST = 'beast', // Thú yêu
  DEMON = 'demon', // Yêu ma
  SPIRIT = 'spirit', // Linh thể
  CULTIVATOR = 'cultivator', // Tu giả
}

export enum MonsterRarity {
  COMMON = 'common', // Thường
  UNCOMMON = 'uncommon', // Hiếm
  RARE = 'rare', // Quý
  EPIC = 'epic', // Cực phẩm
  LEGENDARY = 'legendary', // Truyền thuyết
}

@Entity('monsters')
export class Monster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({
    type: 'enum',
    enum: MonsterType,
    default: MonsterType.BEAST,
  })
  type: MonsterType;

  @Column({
    type: 'enum',
    enum: MonsterRarity,
    default: MonsterRarity.COMMON,
  })
  rarity: MonsterRarity;

  @Column({ default: 1 })
  level: number; // Cấp độ quái vật

  @Column({ default: true })
  is_active: boolean;

  // ========== Combat Stats ==========
  // Base stats (sẽ được scale theo level)
  @Column({ default: 100 })
  base_hp: number;

  @Column({ default: 50 })
  base_mp: number;

  @Column({ default: 20 })
  base_physical_attack: number;

  @Column({ default: 15 })
  base_magical_attack: number;

  @Column({ default: 10 })
  base_physical_defense: number;

  @Column({ default: 8 })
  base_magical_defense: number;

  @Column({ default: 5 })
  base_critical_chance: number; // %

  @Column({ default: 150 })
  base_critical_damage: number; // %

  @Column({ default: 10 })
  base_speed: number;

  @Column({ default: 5 })
  base_dodge: number; // %

  // ========== Rewards ==========
  @Column({ default: 0 })
  exp_reward: number; // EXP nhận được khi đánh bại

  @Column({ default: 0 })
  gold_reward: number; // Vàng nhận được

  @Column({ type: 'json', nullable: true })
  item_drops: {
    item_id: number;
    drop_rate: number; // 0-100 (%)
  }[];

  @OneToMany(() => MonsterSkill, (monsterSkill) => monsterSkill.monster)
  monsterSkills: MonsterSkill[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

