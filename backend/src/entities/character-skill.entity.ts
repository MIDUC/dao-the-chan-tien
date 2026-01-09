import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Character } from './character.entity';
import { Skill } from './skill.entity';

@Entity('character_skills')
export class CharacterSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column()
  skill_id: number;

  @ManyToOne(() => Skill, (skill) => skill.character_skills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  // Level hiện tại của skill
  @Column({ default: 1 })
  level: number;

  // EXP của skill (để level up)
  @Column({ default: 0 })
  exp: number;

  // Đã unlock chưa
  @Column({ default: false })
  is_unlocked: boolean;

  @Column({ type: 'datetime', nullable: true })
  unlocked_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

