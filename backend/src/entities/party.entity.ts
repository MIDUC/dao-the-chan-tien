import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PartyMember } from './party-member.entity';

@Entity('parties')
export class Party {
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
  @Column({ default: 5 })
  max_members: number;

  // Party level (có thể tăng theo hoạt động)
  @Column({ default: 1 })
  level: number;

  // EXP của party
  @Column({ default: 0 })
  exp: number;

  @OneToMany(() => PartyMember, (member) => member.party)
  members: PartyMember[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

