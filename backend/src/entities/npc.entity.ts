import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Quest } from './quest.entity';

@Entity('npcs')
export class NPC {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ default: true })
  is_active: boolean;

  // NPC xuất hiện trong khoảng thời gian nào (optional)
  @Column({ type: 'time', nullable: true })
  spawn_time_start: string;

  @Column({ type: 'time', nullable: true })
  spawn_time_end: string;

  @OneToMany(() => Quest, (quest) => quest.npc)
  quests: Quest[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

