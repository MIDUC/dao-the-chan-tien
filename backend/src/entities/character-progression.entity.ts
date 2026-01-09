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

/**
 * Track character progression requirements
 * This table stores counts for various requirements like do_kiep, luyen_the, etc.
 */
@Entity('character_progressions')
export class CharacterProgression {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  /**
   * Type of progression requirement
   * - do_kiep: Số lần đã độ kiếp
   * - luyen_the: Số lần đã luyện thể
   * - dan_thuoc: Số đan dược đã sử dụng (có thể check từ inventory)
   * - cong_duc: Công đức tích lũy
   */
  @Column()
  requirement_type: string;

  /**
   * Current count/value for this requirement
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  count: number;

  /**
   * Additional metadata (JSON)
   * Example: { last_do_kiep_at: "2024-01-01", success_rate_boost: 0.1 }
   */
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

