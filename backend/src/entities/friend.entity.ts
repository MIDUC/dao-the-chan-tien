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

export enum FriendStatus {
  PENDING = 'pending', // Đang chờ
  ACCEPTED = 'accepted', // Đã chấp nhận
  BLOCKED = 'blocked', // Đã chặn
}

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column()
  friend_character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'friend_character_id' })
  friend: Character;

  @Column({
    type: 'enum',
    enum: FriendStatus,
    default: FriendStatus.PENDING,
  })
  status: FriendStatus;

  // Ai gửi request
  @Column()
  requester_id: number;

  @Column({ type: 'datetime', nullable: true })
  accepted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

