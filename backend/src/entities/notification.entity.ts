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

export enum NotificationType {
  QUEST_DEADLINE = 'quest_deadline', // Quest sắp hết hạn
  EVENT_START = 'event_start', // Sự kiện bắt đầu
  FRIEND_REQUEST = 'friend_request', // Lời mời kết bạn
  ACHIEVEMENT = 'achievement', // Đạt thành tựu
  GIFT_RECEIVED = 'gift_received', // Nhận quà
  GUILD_INVITE = 'guild_invite', // Lời mời bang hội
  SYSTEM = 'system', // Thông báo hệ thống
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notification_type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  // Dữ liệu liên quan (JSON)
  @Column({ type: 'json', nullable: true })
  data: {
    quest_id?: number;
    event_id?: number;
    friend_id?: number;
    achievement_id?: number;
    // ... flexible data
  };

  // Đã đọc chưa
  @Column({ default: false })
  is_read: boolean;

  // Đã xóa chưa
  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

