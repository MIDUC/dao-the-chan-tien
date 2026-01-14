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
import { Item } from './item.entity';

/**
 * Ancient Artifact (Cổ Bảo) - Không giới hạn số lượng, stats cộng dồn
 * Khác với Equipment, Cổ Bảo có thể trang bị nhiều cái cùng lúc
 */
@Entity('ancient_artifacts')
export class AncientArtifact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column()
  item_id: number;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  // Stats từ cổ bảo này (từ inventory's specific_stats hoặc item's base stats)
  @Column({ type: 'json', nullable: true })
  stats: {
    strength?: number;
    agility?: number;
    wisdom?: number;
    hp?: number;
    defense?: number;
    [key: string]: any; // Allow other stats
  };

  // Effects (Tác dụng) - Buffs khi trang bị cổ bảo
  @Column({ type: 'json', nullable: true })
  effects: {
    // Combat effects
    attack_bonus?: number; // Tăng tấn công
    defense_bonus?: number; // Tăng phòng thủ
    hp_bonus?: number; // Tăng HP
    mp_bonus?: number; // Tăng MP
    crit_chance?: number; // Tăng tỷ lệ bạo kích
    crit_damage?: number; // Tăng sát thương bạo kích
    speed_bonus?: number; // Tăng tốc độ
    dodge_chance?: number; // Tăng tỷ lệ né tránh
    // Other effects
    exp_bonus?: number; // Tăng EXP gain
    drop_rate_bonus?: number; // Tăng tỷ lệ rơi đồ
    [key: string]: any;
  };

  // Penalties (Tác hại) - Debuffs khi trang bị cổ bảo
  @Column({ type: 'json', nullable: true })
  penalties: {
    // Combat penalties
    hp_loss_per_attack?: number; // Mất máu mỗi lần tấn công
    mp_loss_per_skill?: number; // Mất MP mỗi lần dùng skill
    hp_drain_per_second?: number; // Mất máu mỗi giây
    mp_drain_per_second?: number; // Mất MP mỗi giây
    defense_reduction?: number; // Giảm phòng thủ
    speed_reduction?: number; // Giảm tốc độ
    // Other penalties
    exp_reduction?: number; // Giảm EXP gain
    stat_reduction?: {
      strength?: number;
      agility?: number;
      wisdom?: number;
    };
    [key: string]: any;
  };

  // Level enhance (nếu có hệ thống nâng cấp)
  @Column({ default: 0 })
  enhance_level: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

