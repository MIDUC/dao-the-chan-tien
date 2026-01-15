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

/**
 * Element types (Linh Căn)
 */
export enum ElementType {
  KIM = 'kim', // Kim
  MOC = 'moc', // Mộc
  THUY = 'thuy', // Thủy
  HOA = 'hoa', // Hỏa
  THO = 'tho', // Thổ
  LOI = 'loi', // Lôi
  BANG = 'bang', // Băng
  DUONG = 'duong', // Dương
  AM = 'am', // Âm
}

/**
 * Element grade/quality
 */
export enum ElementGrade {
  PHAM = 'pham', // Phàm
  TOT = 'tot', // Tốt
  HIEM = 'hiem', // Hiếm
  CUC_HIEM = 'cuc_hiem', // Cực Hiếm
  HUYEN_THOAI = 'huyen_thoai', // Huyền Thoại
  THAN_THOAI = 'than_thoai', // Thần Thoại
}

@Entity('character_elements')
export class CharacterElement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @Column({
    type: 'enum',
    enum: ElementType,
  })
  element_type: ElementType;

  @Column({
    type: 'enum',
    enum: ElementGrade,
    default: ElementGrade.PHAM,
  })
  grade: ElementGrade;

  @Column({ default: 1 })
  level: number; // Cấp độ linh căn (1-100)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  exp: number; // EXP hiện tại của linh căn

  @ManyToOne(() => Character, (character) => character.elements)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

