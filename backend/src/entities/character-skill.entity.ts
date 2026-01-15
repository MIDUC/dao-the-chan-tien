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

  @Column()
  skill_id: number;

  @Column({ default: 1 })
  level: number; // Cấp độ kỹ năng

  @Column({ default: 0 })
  exp: number; // EXP của kỹ năng

  @Column({ default: false })
  is_unlocked: boolean; // Đã mở khóa chưa

  @Column({ type: 'datetime', nullable: true })
  learned_at: Date; // Thời gian học được

  @Column({ type: 'datetime', nullable: true })
  unlocked_at: Date; // Thời gian mở khóa

  @ManyToOne(() => Character, (character) => character.characterSkills)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @ManyToOne(() => Skill, (skill) => skill.characterSkills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
