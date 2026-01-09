import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number;

  @ManyToOne(() => User, (user) => user.characters)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  display_name: string;

  @Column({ default: 1 })
  realm_level: number; // Luyện Khí = 1, Trúc Cơ = 2, Kim Đan = 3, ...

  @Column({ default: 0 })
  exp: number;

  // Base EXP per interval (cộng mỗi lần theo interval)
  // Mỗi lần độ kiếp sẽ được random thêm EXP vào đây
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 10 })
  base_exp_per_interval: number;

  // Chỉ số cơ bản
  @Column({ default: 10 })
  strength: number; // Thể Phách / Linh Lực

  @Column({ default: 10 })
  agility: number; // Thân Pháp / Thể Lực

  @Column({ default: 10 })
  wisdom: number; // Tâm Cảnh / Tinh Thần

  // Last login time for offline cultivation calculation
  @Column({ type: 'datetime', nullable: true })
  last_login_at: Date;

  // Maximum inventory slots (can be expanded through breakthrough or purchase)
  @Column({ default: 20 })
  max_inventory_slots: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
