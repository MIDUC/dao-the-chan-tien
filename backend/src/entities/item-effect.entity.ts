import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Item } from './item.entity';

export enum EffectType {
  HEAL = 'heal', // Hồi máu
  BUFF = 'buff', // Tăng chỉ số tạm thời
  EXP_BOOST = 'exp_boost', // Tăng EXP
  REALM_BOOST = 'realm_boost', // Tăng tu vi
  STAT_INCREASE = 'stat_increase', // Tăng chỉ số vĩnh viễn
  CURRENCY = 'currency', // Tiền tệ
  UNLOCK = 'unlock', // Mở khóa tính năng
}

@Entity('item_effects')
export class ItemEffect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  item_id: number;

  @ManyToOne(() => Item, (item) => item.effects)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({
    type: 'enum',
    enum: EffectType,
  })
  effect_type: EffectType;

  // Giá trị hiệu ứng (JSON để linh hoạt)
  @Column({ type: 'json' })
  effect_value: {
    amount?: number;
    stat_type?: string; // 'strength', 'agility', 'wisdom', etc.
    duration?: number; // Thời gian (giây) nếu là buff
    percentage?: number; // Phần trăm nếu là boost
  };

  // Mô tả hiệu ứng
  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

