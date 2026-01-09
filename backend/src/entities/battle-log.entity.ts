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

export enum BattleType {
  PVE = 'pve', // Player vs Environment
  PVP = 'pvp', // Player vs Player
  BOSS = 'boss', // Đánh boss
  ARENA = 'arena', // Đấu trường
}

export enum BattleResult {
  WIN = 'win',
  LOSE = 'lose',
  DRAW = 'draw',
}

@Entity('battle_logs')
export class BattleLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  // Đối thủ (character_id hoặc monster_id)
  @Column({ nullable: true })
  opponent_id: number;

  @Column({
    type: 'enum',
    enum: BattleType,
  })
  battle_type: BattleType;

  @Column({
    type: 'enum',
    enum: BattleResult,
  })
  result: BattleResult;

  // Thông tin trận đấu (JSON)
  @Column({ type: 'json', nullable: true })
  battle_data: {
    rounds?: number;
    damage_dealt?: number;
    damage_taken?: number;
    skills_used?: string[];
    duration_seconds?: number;
  };

  // EXP nhận được
  @Column({ default: 0 })
  exp_gained: number;

  // Items nhận được
  @Column({ type: 'json', nullable: true })
  items_dropped: Array<{ item_id: number; quantity: number }>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

