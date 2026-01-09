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

export enum AlchemyStatus {
  IN_PROGRESS = 'in_progress', // Đang luyện
  COMPLETED = 'completed', // Hoàn thành
  FAILED = 'failed', // Thất bại
}

@Entity('alchemy')
export class Alchemy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  // Recipe ID (có thể tạo bảng recipes riêng sau)
  @Column()
  recipe_id: number;

  // Nguyên liệu đã dùng (JSON: item_id -> quantity)
  @Column({ type: 'json' })
  materials_used: Record<number, number>;

  // Sản phẩm tạo ra
  @Column()
  result_item_id: number;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'result_item_id' })
  result_item: Item;

  // Số lượng sản phẩm
  @Column({ default: 1 })
  result_quantity: number;

  @Column({
    type: 'enum',
    enum: AlchemyStatus,
    default: AlchemyStatus.IN_PROGRESS,
  })
  status: AlchemyStatus;

  // Thời gian bắt đầu luyện
  @Column({ type: 'datetime' })
  started_at: Date;

  // Thời gian hoàn thành (tính bằng giây)
  @Column()
  duration_seconds: number;

  // Thời gian hoàn thành dự kiến
  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

