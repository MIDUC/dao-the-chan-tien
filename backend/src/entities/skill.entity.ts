import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ElementType } from './character-element.entity';
import { CharacterSkill } from './character-skill.entity';

/**
 * Skill damage formula component
 */
export interface DamageFormula {
  stat?: string; // Stat name like 'luc_dao', 'can_cot', etc.
  element?: ElementType; // Element type
  multiplier: number; // Multiplier percentage (e.g., 200 = 200%)
}

@Entity('skills')
@Index(['code', 'character_id'], { unique: true })
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  // Code is unique per character (or globally if character_id is null)
  // For personal skills: code can be same across characters but must be unique per character
  @Column()
  code: string; // Code like 'hoa_van_chuong' or 'personal_skill_1'

  // Character ID if this is a personal skill (null = global skill available to all)
  @Column({ type: 'int', nullable: true })
  character_id: number | null;

  @Column()
  name: string; // Tên kỹ năng

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả kỹ năng

  @Column({ type: 'json' })
  damage_formula: DamageFormula[]; // Công thức sát thương

  // Buffs/Debuffs that this skill applies
  @Column({ type: 'json', nullable: true })
  buffs?: {
    stat_type: 
      // Combat stats
      | 'physical_attack' | 'magical_attack' | 'physical_defense' | 'magical_defense' 
      | 'critical_chance' | 'critical_damage' | 'speed' | 'dodge' | 'hp' | 'mp'
      // Primary stats (Tầng Gốc)
      | 'luc_dao' | 'can_cot' | 'than_phap' | 'ngo_tinh' | 'dinh_luc'
      // Elements (Nguyên tố - Linh Căn)
      | 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho' | 'loi' | 'bang' | 'duong' | 'am'
      // Qi Types (Tất cả các loại khí)
      | 'blood_qi' | 'spiritual_qi' | 'vital_qi' // Nhóm Cơ Bản
      | 'righteous_qi' | 'killing_qi' | 'scholarly_qi' | 'demonic_qi' // Nhóm Tính Cách & Phe Phái
      | 'frost_qi' | 'yang_qi' | 'yin_qi' | 'impure_qi' // Nhóm Nguyên Tố & Môi Trường
      | 'prenatal_qi' | 'grandmist_purple_qi' | 'chaos_qi' | 'imperial_qi' // Nhóm Cao Cấp & Truyền Thuyết
      | 'death_qi' // Nhóm Độc Hại
      | 'aura_qi' | 'corpse_qi' // Nhóm Phòng Thủ & Hỗ Trợ
      | 'resentment_qi' | 'charm_qi' // Nhóm Đặc Biệt & Ẩn
      // Debuff stats (giảm chỉ số đối thủ)
      | 'hp_regen' | 'mp_regen'; // Giảm hồi phục HP/MP
    value_type: 'percentage' | 'flat'; // percentage = %, flat = absolute value
    value: number; // Percentage (e.g., 50 = 50%) or flat value. For debuffs, use negative values or set target to 'enemy'
    duration_rounds?: number; // Duration in rounds (if not set, lasts until combat ends)
    stack_type?: 'additive' | 'multiplicative'; // How buffs stack (default: additive for percentage)
    target?: 'self' | 'enemy'; // 'self' = buff cho bản thân, 'enemy' = debuff cho đối thủ (default: 'self')
  }[];

  @Column({ default: 0 })
  cooldown: number; // Thời gian hồi chiêu (giây)

  @Column({ default: 0 })
  mana_cost: number; // Chi phí mana/linh khí

  @Column({ default: 1 })
  min_level: number; // Cấp độ tối thiểu để học

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => CharacterSkill, (characterSkill) => characterSkill.skill)
  characterSkills: CharacterSkill[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
