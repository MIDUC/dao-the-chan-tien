import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ShopItem } from './shop-item.entity';

export enum ShopType {
  NPC_SHOP = 'npc_shop', // Cửa hàng NPC
  PLAYER_MARKET = 'player_market', // Chợ người chơi
  GUILD_SHOP = 'guild_shop', // Cửa hàng bang hội
  EVENT_SHOP = 'event_shop', // Cửa hàng sự kiện
}

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ShopType,
  })
  shop_type: ShopType;

  // NPC ID (nếu là NPC shop)
  @Column({ nullable: true })
  npc_id: number;

  // Guild ID (nếu là guild shop)
  @Column({ nullable: true })
  guild_id: number;

  @OneToMany(() => ShopItem, (item) => item.shop)
  items: ShopItem[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

