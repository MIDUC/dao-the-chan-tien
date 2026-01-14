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
  // Vũ khí: 2 slot
  WEAPON_1 = 'weapon_1', // Vũ khí 1
  WEAPON_2 = 'weapon_2', // Vũ khí 2
  
  // Giáp: 1 slot
  ARMOR = 'armor', // Giáp
  
  // Mũ: 1 slot
  HELMET = 'helmet', // Mũ
  
  // Giày: 1 slot
  BOOTS = 'boots', // Giày
  
  // Vòng: 2 slot
  BRACELET_1 = 'bracelet_1', // Vòng 1
  BRACELET_2 = 'bracelet_2', // Vòng 2
  
  // Nhẫn: 4 slot
  RING_1 = 'ring_1', // Nhẫn 1
  RING_2 = 'ring_2', // Nhẫn 2
  RING_3 = 'ring_3', // Nhẫn 3
  RING_4 = 'ring_4', // Nhẫn 4
  
  // Pháp bảo: 10 slot (mở từ Nguyên Anh - level 31+)
  ARTIFACT_1 = 'artifact_1', // Pháp bảo 1
  ARTIFACT_2 = 'artifact_2', // Pháp bảo 2
  ARTIFACT_3 = 'artifact_3', // Pháp bảo 3
  ARTIFACT_4 = 'artifact_4', // Pháp bảo 4
  ARTIFACT_5 = 'artifact_5', // Pháp bảo 5
  ARTIFACT_6 = 'artifact_6', // Pháp bảo 6
  ARTIFACT_7 = 'artifact_7', // Pháp bảo 7
  ARTIFACT_8 = 'artifact_8', // Pháp bảo 8
  ARTIFACT_9 = 'artifact_9', // Pháp bảo 9
  ARTIFACT_10 = 'artifact_10', // Pháp bảo 10
  
  // Legacy slots (for backward compatibility)
  WEAPON = 'weapon', // Deprecated: use WEAPON_1
  ACCESSORY_1 = 'accessory_1', // Deprecated
  ACCESSORY_2 = 'accessory_2', // Deprecated
  NECKLACE = 'necklace', // Deprecated
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

