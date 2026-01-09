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
import { Party } from './party.entity';
import { Guild } from './guild.entity';

export enum StatusLogType {
  THE_SU = 'Thế Sự',
  TU_VI = 'Tu Vi',
  THU_HOACH = 'Thu Hoạch',
  HOI_PHUC = 'Hồi Phục',
}

@Entity('status_logs')
export class StatusLog {
  @PrimaryGeneratedColumn()
  id: number;

  // Character ID - nếu có thì log riêng của character đó
  @Column({ nullable: true })
  character_id: number;

  @ManyToOne(() => Character, { nullable: true })
  @JoinColumn({ name: 'character_id' })
  character: Character;

  // Party ID - nếu có thì log của tất cả member trong party
  @Column({ nullable: true })
  party_id: number;

  @ManyToOne(() => Party, { nullable: true })
  @JoinColumn({ name: 'party_id' })
  party: Party;

  // Guild ID - nếu có thì log của tất cả member trong guild
  @Column({ nullable: true })
  guild_id: number;

  @ManyToOne(() => Guild, { nullable: true })
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  // Type of status log
  @Column({
    type: 'enum',
    enum: StatusLogType,
  })
  type: StatusLogType;

  // Message content
  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

