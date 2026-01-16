import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Monster } from './monster.entity';
import { Skill } from './skill.entity';

@Entity('monster_skills')
export class MonsterSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  monster_id: number;

  @Column()
  skill_id: number;

  @ManyToOne(() => Monster, (monster) => monster.monsterSkills)
  @JoinColumn({ name: 'monster_id' })
  monster: Monster;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  // Skill level for this monster (affects damage)
  @Column({ default: 1 })
  skill_level: number;

  // Priority: higher priority skills are used more often
  @Column({ default: 1 })
  priority: number; // 1-10, higher = more likely to use

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

