import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CharacterSkill } from './character-skill.entity';

export enum SkillType {
  PASSIVE = 'passive', // Kỹ năng thụ động
  ACTIVE = 'active', // Kỹ năng chủ động
  ULTIMATE = 'ultimate', // Kỹ năng tối thượng
}

export enum SkillCategory {
  COMBAT = 'combat', // Chiến đấu
  CULTIVATION = 'cultivation', // Tu luyện
  CRAFTING = 'crafting', // Chế tạo
  SOCIAL = 'social', // Xã hội
}

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: SkillType,
  })
  skill_type: SkillType;

  @Column({
    type: 'enum',
    enum: SkillCategory,
  })
  category: SkillCategory;

  // Yêu cầu để học
  @Column({ type: 'json' })
  requirements: {
    realm_level?: number;
    prerequisite_skill_ids?: number[]; // Skills cần học trước
    item_cost?: Array<{ item_id: number; quantity: number }>;
  };

  // Hiệu ứng skill (JSON)
  @Column({ type: 'json' })
  effects: {
    stat_bonus?: {
      strength?: number;
      agility?: number;
      wisdom?: number;
    };
    combat_damage?: number;
    cooldown_seconds?: number;
    duration_seconds?: number;
  };

  // Max level của skill
  @Column({ default: 1 })
  max_level: number;

  // Icon URL
  @Column({ nullable: true })
  icon_url: string;

  @OneToMany(() => CharacterSkill, (cs) => cs.skill)
  character_skills: CharacterSkill[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

