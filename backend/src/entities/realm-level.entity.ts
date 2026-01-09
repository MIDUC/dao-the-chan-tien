import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Requirements for breaking through to a realm level
 * Example: { type: "do_kiep", count: 1, success_rate: { min: 0.3, max: 0.5 } }
 */
export interface RealmRequirement {
  type: 'do_kiep' | 'luyen_the' | 'dan_thuoc' | 'cong_duc' | 'linh_thach' | 'tien_ngoc';
  count: number;
  success_rate?: {
    min: number; // Minimum success rate (0-1)
    max: number; // Maximum success rate (0-1)
  };
  description?: string;
}

@Entity('realm_levels')
export class RealmLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  level: number; // Realm level (1, 2, 3, ...)

  @Column()
  name: string; // Display name, e.g., "Luyện Khí Tầng 1", "Luyện Khí Tầng 2"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  exp_required: number; // EXP required to reach this level

  /**
   * Requirements to break through to this level
   * Stored as JSON array of RealmRequirement
   */
  @Column({ type: 'json', nullable: true })
  requirements: RealmRequirement[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

