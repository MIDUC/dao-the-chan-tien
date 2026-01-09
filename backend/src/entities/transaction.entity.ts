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
import { Item } from './item.entity';
import { Shop } from './shop.entity';

export enum TransactionType {
  BUY = 'buy', // Mua
  SELL = 'sell', // Bán
  TRADE = 'trade', // Giao dịch giữa players
  GIFT = 'gift', // Tặng
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transaction_type: TransactionType;

  @Column({ nullable: true })
  item_id: number;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ nullable: true })
  shop_id: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  // Người chơi khác (nếu là trade/gift)
  @Column({ nullable: true })
  target_character_id: number;

  @Column()
  quantity: number;

  // Giá trị giao dịch
  @Column()
  amount: number;

  @Column()
  currency_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

