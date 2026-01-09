import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shop } from './shop.entity';
import { Item } from './item.entity';

@Entity('shop_items')
export class ShopItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shop_id: number;

  @ManyToOne(() => Shop, (shop) => shop.items)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  item_id: number;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  // Giá bán (có thể khác với sell_price của item)
  @Column()
  price: number;

  // Loại tiền tệ
  @Column()
  currency_type: string; // 'ling_stone', 'merit_point', 'essence'

  // Số lượng có sẵn (null = unlimited)
  @Column({ nullable: true })
  stock: number;

  // Số lượng đã bán
  @Column({ default: 0 })
  sold_count: number;

  // Giới hạn mua mỗi ngày (null = unlimited)
  @Column({ nullable: true })
  daily_limit: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

