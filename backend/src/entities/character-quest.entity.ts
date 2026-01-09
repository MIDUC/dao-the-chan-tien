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
import { Quest } from './quest.entity';
import { QuestStatus } from './quest.entity';

@Entity('character_quests')
export class CharacterQuest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column()
  quest_id: number;

  @ManyToOne(() => Quest)
  @JoinColumn({ name: 'quest_id' })
  quest: Quest;

  @Column({
    type: 'enum',
    enum: QuestStatus,
    default: QuestStatus.ACCEPTED,
  })
  status: QuestStatus;

  // Tiến độ hoàn thành (ví dụ: đã chống đẩy 5/10 lần)
  @Column({ type: 'json', nullable: true })
  progress: {
    current?: number;
    target?: number;
    completed_at?: string;
  };

  @Column({ type: 'datetime' })
  accepted_at: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @Column({ type: 'datetime', nullable: true })
  deadline: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

