import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CharacterAchievement } from './character-achievement.entity';

export enum AchievementType {
  QUEST = 'quest', // Hoàn thành quest
  REALM = 'realm', // Đạt cảnh giới
  CHECKIN = 'checkin', // Điểm danh
  COMBAT = 'combat', // Chiến đấu
  SOCIAL = 'social', // Tương tác xã hội
  COLLECTION = 'collection', // Thu thập
  EXPLORATION = 'exploration', // Khám phá
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AchievementType,
  })
  achievement_type: AchievementType;

  // Điều kiện để unlock (JSON)
  @Column({ type: 'json' })
  conditions: {
    quest_count?: number;
    realm_level?: number;
    checkin_days?: number;
    combat_wins?: number;
    friend_count?: number;
    item_count?: number;
    // ... flexible conditions
  };

  // Phần thưởng
  @Column({ type: 'json' })
  rewards: {
    exp?: number;
    items?: Array<{ item_id: number; quantity: number }>;
    currency?: Array<{ type: string; amount: number }>;
    title?: string; // Danh hiệu
  };

  // Icon/Image URL
  @Column({ nullable: true })
  icon_url: string;

  // Rarity/rarity của achievement
  @Column({ default: 1 })
  rarity: number; // 1-5, 5 là hiếm nhất

  @OneToMany(() => CharacterAchievement, (ca) => ca.achievement)
  character_achievements: CharacterAchievement[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

