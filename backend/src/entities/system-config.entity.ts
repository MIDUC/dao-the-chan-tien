import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_config')
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string; // Config key (e.g., 'cultivation_interval_seconds', 'base_exp_rate')

  @Column({ type: 'text' })
  value: string; // Config value (stored as string, can be JSON)

  @Column({ type: 'text', nullable: true })
  description: string; // Description of what this config does

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

