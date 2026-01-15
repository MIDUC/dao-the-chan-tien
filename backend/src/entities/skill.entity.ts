import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
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
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Unique code like 'hoa_van_chuong'

  @Column()
  name: string; // Tên kỹ năng

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả kỹ năng

  @Column({ type: 'json' })
  damage_formula: DamageFormula[]; // Công thức sát thương

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
