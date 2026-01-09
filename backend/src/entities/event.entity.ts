import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CharacterEvent } from './character-event.entity';

export enum EventType {
  DAILY = 'daily', // Sự kiện hàng ngày
  WEEKLY = 'weekly', // Sự kiện hàng tuần
  LIMITED = 'limited', // Sự kiện giới hạn thời gian
  SEASONAL = 'seasonal', // Sự kiện theo mùa
  SPECIAL = 'special', // Sự kiện đặc biệt
}

export enum EventStatus {
  UPCOMING = 'upcoming', // Sắp diễn ra
  ACTIVE = 'active', // Đang diễn ra
  ENDED = 'ended', // Đã kết thúc
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  event_type: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING,
  })
  status: EventStatus;

  // Thời gian bắt đầu
  @Column({ type: 'datetime' })
  start_time: Date;

  // Thời gian kết thúc
  @Column({ type: 'datetime' })
  end_time: Date;

  // Phần thưởng (JSON)
  @Column({ type: 'json', nullable: true })
  rewards: {
    exp?: number;
    items?: Array<{ item_id: number; quantity: number }>;
    currency?: number;
  };

  // Yêu cầu để tham gia (JSON)
  @Column({ type: 'json', nullable: true })
  requirements: {
    min_level?: number;
    min_realm_level?: number;
    roles?: string[]; // Roles được phép tham gia
  };

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => CharacterEvent, (ce) => ce.event)
  character_events: CharacterEvent[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

