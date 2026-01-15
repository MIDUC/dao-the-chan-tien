import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CharacterTalent } from './character-talent.entity';
import { CharacterElement } from './character-element.entity';
import { CharacterSkill } from './character-skill.entity';

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

  // ========== Tầng Gốc (Primary Stats) - Gắn với Fitness ==========
  @Column({ default: 10 })
  luc_dao: number; // Lực Đạo - Sức Mạnh (Physical Power)

  @Column({ default: 10 })
  can_cot: number; // Căn Cốt - Thể Chất (Constitution)

  @Column({ default: 10 })
  than_phap: number; // Thân Pháp - Nhanh Nhẹn (Agility)

  @Column({ default: 10 })
  ngo_tinh: number; // Ngộ Tính - Trí Tuệ (Wisdom)

  @Column({ default: 10 })
  dinh_luc: number; // Định Lực - Ý Chí (Willpower)

  // ========== Tầng Tiên Thiên (Hidden/Talent Stats) ==========
  @Column({
    type: 'enum',
    enum: ['kim', 'moc', 'thuy', 'hoa', 'tho'],
    default: 'thuy',
  })
  linh_can: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho'; // Linh Căn - Spirit Root (Element)

  @Column({ default: 50 })
  phuc_duyen: number; // Phúc Duyên - Luck (Hidden stat, 0-100)

  @Column({ default: 50 })
  tam_canh: number; // Tâm Cảnh - State of Mind (0-100, affects cultivation stability)

  // ========== Legacy Stats (for backward compatibility) ==========
  // These will be calculated from Primary Stats
  @Column({ default: 10 })
  strength: number; // Deprecated: Use luc_dao

  @Column({ default: 10 })
  agility: number; // Deprecated: Use than_phap

  @Column({ default: 10 })
  wisdom: number; // Deprecated: Use ngo_tinh

  // Last login time for offline cultivation calculation
  @Column({ type: 'datetime', nullable: true })
  last_login_at: Date;

  // Maximum inventory slots (can be expanded through breakthrough or purchase)
  @Column({ default: 20 })
  max_inventory_slots: number;

  @OneToMany(() => CharacterTalent, (characterTalent) => characterTalent.character)
  characterTalents: CharacterTalent[];

  @OneToMany(() => CharacterElement, (element) => element.character)
  elements: CharacterElement[];

  @OneToMany(() => CharacterSkill, (characterSkill) => characterSkill.character)
  characterSkills: CharacterSkill[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
