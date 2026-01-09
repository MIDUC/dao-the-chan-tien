import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Character } from './character.entity';
import { PetSkill } from './pet-skill.entity';

export enum PetRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Pet type/species
  @Column()
  pet_type: string; // 'dragon', 'phoenix', 'tiger', etc.

  @Column({
    type: 'enum',
    enum: PetRarity,
    default: PetRarity.COMMON,
  })
  rarity: PetRarity;

  // Level của pet
  @Column({ default: 1 })
  level: number;

  // EXP của pet
  @Column({ default: 0 })
  exp: number;

  // Chỉ số pet
  @Column({ type: 'json', nullable: true })
  stats: {
    strength?: number;
    agility?: number;
    wisdom?: number;
    hp?: number;
    defense?: number;
  };

  // Pet đang được sử dụng không
  @Column({ default: false })
  is_active: boolean;

  // Avatar URL
  @Column({ nullable: true })
  avatar_url: string;

  @OneToMany(() => PetSkill, (skill) => skill.pet)
  skills: PetSkill[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

