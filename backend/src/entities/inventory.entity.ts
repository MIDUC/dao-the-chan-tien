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

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column()
  item_id: number;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  // Số lượng item
  @Column({ default: 1 })
  quantity: number;

  // Vị trí trong túi đồ (optional, để sắp xếp)
  @Column({ nullable: true })
  slot_position: number;

  // Specific stats của item instance này (JSON)
  // Chỉ có cho equipment - mỗi equipment có stats riêng sau khi random
  // Ví dụ: { "strength": 48, "agility": 35, "enhancement_level": 0, "durability": 100 }
  @Column({ type: 'json', nullable: true })
  specific_stats: {
    strength?: number;
    agility?: number;
    wisdom?: number;
    hp?: number;
    defense?: number;
    enhancement_level?: number;
    durability?: number;
    sockets?: string[];
    hidden_options?: any;
    effects?: any; // For ancient artifacts
    penalties?: any; // For ancient artifacts
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

