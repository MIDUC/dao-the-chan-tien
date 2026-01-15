import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CharacterTalent } from './character-talent.entity';

/**
 * Talent quality/grade enum
 */
export enum TalentGrade {
  COMMON = 'common', // Phàm - Xám
  UNCOMMON = 'uncommon', // Tốt - Xanh lá
  RARE = 'rare', // Hiếm - Xanh dương
  EPIC = 'epic', // Cực hiếm - Tím
  LEGENDARY = 'legendary', // Huyền thoại - Vàng
  MYTHIC = 'mythic', // Thần thoại - Đỏ
}

/**
 * Talent effect type enum
 */
export enum TalentEffectType {
  STAT_BOOST = 'stat_boost', // Tăng chỉ số
  EXP_BOOST = 'exp_boost', // Tăng EXP
  DAMAGE_BOOST = 'damage_boost', // Tăng sát thương
  RESOURCE_GAIN = 'resource_gain', // Nhận tài nguyên
  DAILY_BONUS = 'daily_bonus', // Bonus hàng ngày
  CULTIVATION_BOOST = 'cultivation_boost', // Tăng tu luyện
}

@Entity('talents')
export class Talent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Unique code like 'tien_cot', 'kim_o_the'

  @Column()
  name: string; // Tên thiên phú

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả chi tiết

  @Column({
    type: 'enum',
    enum: TalentGrade,
    default: TalentGrade.COMMON,
  })
  grade: TalentGrade; // Phẩm cấp

  @Column({ type: 'json', nullable: true })
  effects: {
    type: TalentEffectType;
    target?: string; // Stat name or resource type
    value: number; // Percentage or fixed value
    description: string; // Human readable description
  }[]; // Danh sách hiệu ứng

  @Column({ default: false })
  is_starter: boolean; // Có phải thiên phú khởi đầu không

  @Column({ default: true })
  is_active: boolean; // Có đang hoạt động không

  @OneToMany(() => CharacterTalent, (characterTalent) => characterTalent.talent)
  characterTalents: CharacterTalent[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

