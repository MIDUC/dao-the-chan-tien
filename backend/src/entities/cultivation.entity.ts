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

export enum CultivationType {
  MEDITATION = 'meditation', // Thiền định
  BREATHING = 'breathing', // Luyện khí
  BODY_TRAINING = 'body_training', // Luyện thể
  SPIRITUAL = 'spiritual', // Tu tâm
}

@Entity('cultivation')
export class Cultivation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({
    type: 'enum',
    enum: CultivationType,
  })
  cultivation_type: CultivationType;

  // Thời gian bắt đầu
  @Column({ type: 'datetime' })
  started_at: Date;

  // Thời gian kết thúc (nếu đã hoàn thành)
  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  // Thời lượng (giây)
  @Column()
  duration_seconds: number;

  // EXP nhận được
  @Column({ default: 0 })
  exp_gained: number;

  // Linh lực tăng
  @Column({ default: 0 })
  spirit_gained: number;

  // Trạng thái (đang tu luyện / đã hoàn thành)
  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

