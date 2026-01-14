import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NPC } from './npc.entity';

export enum QuestType {
  PUSH_UP = 'push_up',
  RUNNING = 'running',
  MEDITATION = 'meditation',
  COMBAT = 'combat',
}

export enum QuestStatus {
  AVAILABLE = 'available',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  npc_id: number;

  @ManyToOne(() => NPC, (npc) => npc.quests)
  @JoinColumn({ name: 'npc_id' })
  npc: NPC;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: QuestType,
  })
  quest_type: QuestType;

  // Yêu cầu nhiệm vụ (ví dụ: số lần chống đẩy)
  @Column({ type: 'json', nullable: true })
  requirements: {
    min?: number;
    max?: number;
    target?: number;
    unit?: string;
  };

  // Điều kiện để hoàn thành quest (conditions)
  @Column({ type: 'json', nullable: true })
  conditions: {
    // Primary stats requirements
    min_luc_dao?: number;
    min_can_cot?: number;
    min_than_phap?: number;
    min_ngo_tinh?: number;
    min_dinh_luc?: number;
    // Qi requirements
    min_qi?: Array<{ qi_type: string; amount: number }>;
    // Item requirements (must have in inventory)
    required_items?: Array<{ item_id: number; quantity: number }>;
    // Equipment requirements (must be equipped)
    required_equipment?: Array<{ item_id: number; slot?: string }>;
    // Realm level requirement
    min_realm_level?: number;
    // Quest prerequisites (must complete these quests first)
    prerequisite_quests?: number[];
    // Location requirement
    required_location?: string;
    // Time requirement (e.g., must be morning)
    required_time?: string[];
  };

  // Phần thưởng
  @Column({ type: 'json' })
  reward: {
    exp: number;
    spirit?: number; // Linh lực
    items?: Array<{ id: number; quantity: number }>;
  };

  // Deadline (số giờ từ khi nhận nhiệm vụ)
  @Column({ default: 24 })
  deadline_hours: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

