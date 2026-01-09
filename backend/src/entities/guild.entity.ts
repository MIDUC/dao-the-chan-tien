import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GuildMember } from './guild-member.entity';

@Entity('guilds')
export class Guild {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Leader character ID
  @Column()
  leader_id: number;

  // Số thành viên tối đa
  @Column({ default: 50 })
  max_members: number;

  // Guild level
  @Column({ default: 1 })
  level: number;

  // EXP của guild
  @Column({ default: 0 })
  exp: number;

  // Guild funds (tiền của guild)
  @Column({ default: 0 })
  funds: number;

  // Logo/Avatar URL
  @Column({ nullable: true })
  logo_url: string;

  // Banner URL
  @Column({ nullable: true })
  banner_url: string;

  @OneToMany(() => GuildMember, (member) => member.guild)
  members: GuildMember[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

