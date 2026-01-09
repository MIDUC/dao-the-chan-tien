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

export enum CurrencyType {
  LING_STONE = 'ling_stone', // Linh Thạch - tiền chính
  MERIT_POINT = 'merit_point', // Công Đức - từ quest/events
  ESSENCE = 'essence', // Tinh Hoa - premium currency
  IMMORTAL_JADE = 'immortal_jade', // Tiên Ngọc - premium currency
  IMMORTAL_JADE_LOCKED = 'immortal_jade_locked', // Tiên Ngọc khoá - locked premium currency
}

@Entity('currency')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({
    type: 'enum',
    enum: CurrencyType,
  })
  currency_type: CurrencyType;

  @Column({ default: 0 })
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

