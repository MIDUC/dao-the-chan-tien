import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Guild } from './guild.entity';
import { Character } from './character.entity';

export enum GuildRole {
  LEADER = 'leader', // Trưởng bang
  OFFICER = 'officer', // Quan chức
  ELDER = 'elder', // Trưởng lão
  MEMBER = 'member', // Thành viên
}

@Entity('guild_members')
export class GuildMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guild_id: number;

  @ManyToOne(() => Guild, (guild) => guild.members)
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({
    type: 'enum',
    enum: GuildRole,
    default: GuildRole.MEMBER,
  })
  role: GuildRole;

  // Đóng góp của thành viên
  @Column({ default: 0 })
  contribution: number;

  // Đóng góp tuần này
  @Column({ default: 0 })
  weekly_contribution: number;

  @Column({ type: 'datetime' })
  joined_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

