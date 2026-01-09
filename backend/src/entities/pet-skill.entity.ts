import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from './pet.entity';

@Entity('pet_skills')
export class PetSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pet_id: number;

  @ManyToOne(() => Pet, (pet) => pet.skills)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column()
  skill_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Level của skill
  @Column({ default: 1 })
  skill_level: number;

  // Hiệu ứng skill (JSON)
  @Column({ type: 'json', nullable: true })
  effect: {
    type?: string; // 'buff', 'attack', 'heal', etc.
    value?: number;
    duration?: number;
  };

  // Cooldown (giây)
  @Column({ default: 0 })
  cooldown_seconds: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

