import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // 'admin', 'player', 'moderator', etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  // Priority level (higher = more permissions)
  // Admin = 100, Moderator = 50, Player = 1
  @Column({ default: 1 })
  priority: number;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

