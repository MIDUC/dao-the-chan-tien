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
import { Talent } from './talent.entity';

@Entity('character_talents')
export class CharacterTalent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @Column()
  talent_id: number;

  @ManyToOne(() => Character, (character) => character.characterTalents)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @ManyToOne(() => Talent, (talent) => talent.characterTalents)
  @JoinColumn({ name: 'talent_id' })
  talent: Talent;

  @Column({ type: 'datetime', nullable: true })
  obtained_at: Date; // Thời gian nhận được

  @Column({ type: 'varchar', length: 50, nullable: true })
  obtained_from: string; // Nguồn nhận được (registration, quest, alchemy, etc.)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

