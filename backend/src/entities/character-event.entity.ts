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
import { Event } from './event.entity';

@Entity('character_events')
export class CharacterEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column()
  event_id: number;

  @ManyToOne(() => Event, (event) => event.character_events)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  // Tiến độ tham gia (JSON)
  @Column({ type: 'json', nullable: true })
  progress: {
    current?: number;
    target?: number;
    completed_tasks?: string[];
  };

  // Đã nhận phần thưởng chưa
  @Column({ default: false })
  reward_claimed: boolean;

  @Column({ type: 'datetime' })
  joined_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

