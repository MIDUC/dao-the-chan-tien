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

export enum LeaderboardType {
  REALM_LEVEL = 'realm_level', // Cảnh giới cao nhất
  EXP = 'exp', // EXP tổng
  QUEST_COMPLETED = 'quest_completed', // Số quest hoàn thành
  CHECKIN_STREAK = 'checkin_streak', // Chuỗi điểm danh
  COMBAT_WINS = 'combat_wins', // Thắng trận
  ACHIEVEMENT_COUNT = 'achievement_count', // Số thành tựu
}

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time',
}

@Entity('leaderboards')
export class Leaderboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({
    type: 'enum',
    enum: LeaderboardType,
  })
  leaderboard_type: LeaderboardType;

  @Column({
    type: 'enum',
    enum: LeaderboardPeriod,
  })
  period: LeaderboardPeriod;

  @Column()
  score: number;

  @Column()
  rank: number;

  // Ngày của leaderboard (YYYY-MM-DD)
  @Column({ type: 'date', nullable: true })
  period_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

