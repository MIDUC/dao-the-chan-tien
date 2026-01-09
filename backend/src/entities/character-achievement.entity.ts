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
import { Achievement } from './achievement.entity';

@Entity('character_achievements')
export class CharacterAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column()
  achievement_id: number;

  @ManyToOne(() => Achievement, (achievement) => achievement.character_achievements)
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  // Tiến độ (JSON)
  @Column({ type: 'json', nullable: true })
  progress: {
    current?: number;
    target?: number;
  };

  // Đã unlock chưa
  @Column({ default: false })
  is_unlocked: boolean;

  // Đã nhận phần thưởng chưa
  @Column({ default: false })
  reward_claimed: boolean;

  @Column({ type: 'datetime', nullable: true })
  unlocked_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

