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

@Entity('daily_checkins')
export class DailyCheckin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  // Ngày điểm danh (YYYY-MM-DD)
  @Column({ type: 'date' })
  checkin_date: Date;

  // Số ngày liên tiếp đã điểm danh
  @Column({ default: 1 })
  consecutive_days: number;

  // Phần thưởng đã nhận (JSON)
  @Column({ type: 'json', nullable: true })
  rewards: {
    exp?: number;
    items?: Array<{ item_id: number; quantity: number }>;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

