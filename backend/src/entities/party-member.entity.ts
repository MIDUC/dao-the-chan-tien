import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Party } from './party.entity';
import { Character } from './character.entity';

export enum PartyRole {
  LEADER = 'leader', // Trưởng nhóm
  MEMBER = 'member', // Thành viên
  OFFICER = 'officer', // Quan chức (có thể quản lý)
}

@Entity('party_members')
export class PartyMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  party_id: number;

  @ManyToOne(() => Party, (party) => party.members)
  @JoinColumn({ name: 'party_id' })
  party: Party;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({
    type: 'enum',
    enum: PartyRole,
    default: PartyRole.MEMBER,
  })
  role: PartyRole;

  // Đóng góp của thành viên (có thể dùng để tính reward)
  @Column({ default: 0 })
  contribution: number;

  @Column({ type: 'datetime' })
  joined_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

