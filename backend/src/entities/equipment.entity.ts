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

export enum EquipmentSlot {
  WEAPON = 'weapon', // Vũ khí
  ARMOR = 'armor', // Giáp
  HELMET = 'helmet', // Mũ
  BOOTS = 'boots', // Giày
  ACCESSORY_1 = 'accessory_1', // Phụ kiện 1
  ACCESSORY_2 = 'accessory_2', // Phụ kiện 2
  RING_1 = 'ring_1', // Nhẫn 1
  RING_2 = 'ring_2', // Nhẫn 2
  NECKLACE = 'necklace', // Dây chuyền
}

@Entity('equipment')
export class Equipment {
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

  @Column({
    type: 'enum',
    enum: EquipmentSlot,
  })
  slot: EquipmentSlot;

  // Có thể có thêm stats khi trang bị (nếu item được enhance)
  @Column({ type: 'json', nullable: true })
  additional_stats: {
    strength?: number;
    agility?: number;
    wisdom?: number;
    hp?: number;
    defense?: number;
  };

  // Level enhance (nếu có hệ thống nâng cấp)
  @Column({ default: 0 })
  enhance_level: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

