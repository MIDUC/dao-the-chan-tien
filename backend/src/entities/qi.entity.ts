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
 * Enum for all Qi types in the game
 */
export enum QiType {
  // ========== Nhóm Cơ Bản ==========
  BLOOD_QI = 'blood_qi', // Huyết Khí
  SPIRITUAL_QI = 'spiritual_qi', // Linh Khí
  VITAL_QI = 'vital_qi', // Nguyên Khí

  // ========== Nhóm Tính Cách & Phe Phái ==========
  RIGHTEOUS_QI = 'righteous_qi', // Hạo Nhiên Chính Khí
  KILLING_QI = 'killing_qi', // Sát Khí
  SCHOLARLY_QI = 'scholarly_qi', // Văn Khí
  DEMONIC_QI = 'demonic_qi', // Ma Khí

  // ========== Nhóm Nguyên Tố & Môi Trường ==========
  FROST_QI = 'frost_qi', // Hàn Khí
  YANG_QI = 'yang_qi', // Dương Khí
  YIN_QI = 'yin_qi', // Âm Khí
  IMPURE_QI = 'impure_qi', // Trọc Khí

  // ========== Nhóm Cao Cấp & Truyền Thuyết ==========
  PRENATAL_QI = 'prenatal_qi', // Tiên Thiên Khí
  GRANDMIST_PURPLE_QI = 'grandmist_purple_qi', // Hồng Mông Tử Khí (có lợi)
  CHAOS_QI = 'chaos_qi', // Hỗn Độn Khí
  IMPERIAL_QI = 'imperial_qi', // Đế Khí

  // ========== Nhóm Độc Hại ==========
  DEATH_QI = 'death_qi', // Tử Khí (có hại)

  // ========== Nhóm Phòng Thủ & Hỗ Trợ ==========
  AURA_QI = 'aura_qi', // Cương Khí
  CORPSE_QI = 'corpse_qi', // Thi Khí

  // ========== Nhóm Đặc Biệt & Ẩn ==========
  RESENTMENT_QI = 'resentment_qi', // Oán Khí
  CHARM_QI = 'charm_qi', // Mị Khí
}

/**
 * Qi Category for grouping
 */
export enum QiCategory {
  CORE_GAMEPLAY = 'core_gameplay', // Tâm Tính & Hành Vi
  FITNESS = 'fitness', // Thể Chất & Sinh Tồn
  RARE = 'rare', // Đặc Biệt & Ẩn
  ALIGNMENT = 'alignment', // Tính Cách & Phe Phái (legacy)
  ELEMENTAL = 'elemental', // Nguyên Tố & Môi Trường
  LEGENDARY = 'legendary', // Cao Cấp & Truyền Thuyết
  DEFENSIVE = 'defensive', // Phòng Thủ & Hỗ Trợ
}

/**
 * Character Qi - Stores Qi values for each character
 */
@Entity('character_qi')
export class CharacterQi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({
    type: 'enum',
    enum: QiType,
  })
  qi_type: QiType;

  // Current amount of this Qi
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  // Maximum capacity for this Qi (can be increased through cultivation)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 1000 })
  max_amount: number;

  // Regeneration rate per interval (for passive Qi generation)
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  regen_rate: number;

  // Last regeneration time
  @Column({ type: 'datetime', nullable: true })
  last_regen_at: Date;

  // Additional metadata (JSON) for special effects
  @Column({ type: 'json', nullable: true })
  metadata: {
    // For IMPURE_QI: last_activity_at to track inactivity
    last_activity_at?: Date;
    // For DEMONIC_QI: berserk_active, berserk_duration
    berserk_active?: boolean;
    berserk_duration?: number;
    berserk_started_at?: Date;
    // For AURA_QI: shield_active, shield_amount, last_damage_at
    shield_active?: boolean;
    shield_amount?: number;
    last_damage_at?: Date;
    // For CORPSE_QI: poison_stack
    poison_stack?: number;
    // For KILLING_QI: kill_count
    kill_count?: number;
    // For RIGHTEOUS_QI: good_deed_count
    good_deed_count?: number;
    // For SCHOLARLY_QI: knowledge_points
    knowledge_points?: number;
    // For RESENTMENT_QI: killer_id, revenge_active, revenge_expires_at
    killer_id?: number;
    revenge_active?: boolean;
    revenge_expires_at?: Date;
    // For CHARM_QI: charm_count
    charm_count?: number;
    // For PURPLE_QI: obtained_at_time (5:00-7:00 AM)
    obtained_at_time?: string;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * Qi Effect - Defines what each Qi type does
 */
@Entity('qi_effects')
export class QiEffect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: QiType,
    unique: true,
  })
  qi_type: QiType;

  @Column({
    type: 'enum',
    enum: QiCategory,
  })
  category: QiCategory;

  @Column()
  name: string; // Vietnamese name

  @Column({ type: 'text' })
  description: string;

  // Effects in JSON format
  @Column({ type: 'json' })
  effects: {
    // Passive effects (always active when Qi > 0)
    passive?: {
      hp_regen_per_second?: number; // HP regen per second
      mp_regen_per_second?: number; // MP regen per second
      physical_resistance?: number; // Physical damage reduction (%)
      magic_resistance?: number; // Magic damage resistance (%)
      skill_learning_speed?: number; // Skill learning speed multiplier
      npc_price_reduction?: number; // NPC shop price reduction (%)
      debuff_resistance?: number; // Debuff resistance (%)
      crit_damage_bonus?: number; // Critical damage bonus (%)
      fear_chance?: number; // Fear effect chance on weak enemies (%)
      stealth_bonus?: number; // Stealth bonus
      soul_damage_bonus?: number; // Soul damage bonus (%)
      slow_chance?: number; // Slow effect chance (%)
      freeze_chance?: number; // Freeze effect chance (%)
      burn_chance?: number; // Burn effect chance (%)
      cultivation_speed_penalty?: number; // Negative: slows cultivation (%)
    };
    // Active effects (triggered by actions)
    active?: {
      breakthrough_success_rate?: number; // Breakthrough success rate bonus (%)
      revival_chance?: number; // Revival chance (%)
      refine_success_rate?: number; // Equipment refine success rate (%)
      root_bone_improvement?: number; // Permanent root bone improvement
      damage_conversion?: boolean; // Convert damage to enemy's weakest type
      guild_buff?: {
        strength_bonus?: number;
        agility_bonus?: number;
        wisdom_bonus?: number;
      };
      berserk?: {
        damage_multiplier?: number; // Damage multiplier when berserk
        hp_drain_per_second?: number; // HP drain per second when berserk
        duration?: number; // Berserk duration in seconds
      };
      shield?: {
        max_shield?: number; // Maximum shield amount
        regen_rate?: number; // Shield regen per second after 5s no damage
        regen_delay?: number; // Seconds before shield starts regen
      };
      poison_reflect?: {
        damage_per_second?: number; // Poison damage per second
        duration?: number; // Poison duration in seconds
      };
      revenge_mode?: {
        damage_multiplier?: number; // Damage multiplier against killer
        duration?: number; // Duration in seconds
      };
      charm_effect?: {
        npc_charm_chance?: number; // Chance to charm NPC (%)
        pet_tame_chance?: number; // Chance to tame pet (%)
        first_strike_avoid?: number; // Chance to avoid first strike (%)
      };
      convert_to_any?: boolean; // Can convert to any Qi type
    };
    // Negative effects (penalties/risks)
    penalties?: {
      // Tâm Ma (Heart Demon) - stronger when breaking through
      heart_demon_strength?: number; // Multiplier for heart demon boss
      // Loss of control
      self_attack_chance?: number; // Chance to attack self (%)
      cannot_use_heal_chance?: number; // Chance to be unable to use healing items (%)
      // Social penalties
      npc_refuse_trade?: boolean; // NPCs refuse to trade
      price_increase?: number; // Price increase (%)
      // Stat penalties
      magic_resistance_penalty?: number; // Magic resistance reduction (%)
      physical_resistance_penalty?: number; // Physical resistance reduction (%)
      cultivation_speed_penalty?: number; // Cultivation speed reduction (%)
      luck_penalty?: number; // Luck reduction
      // Mana capacity reduction
      mana_capacity_reduction?: number; // Reduces max mana
      // HP drain
      hp_drain_per_second?: number; // HP drain per second
      // Attracts specific enemies
      attract_enemy_type?: string; // Enemy type that prioritizes you
      // Gender-based penalties
      same_gender_attack_bonus?: number; // Enemies of same gender attack harder (%)
    };
    // Requirements to gain this Qi
    sources?: {
      fitness_activities?: string[]; // e.g., ['gym', 'weight_lifting', 'squat']
      quest_types?: string[]; // e.g., ['help_npc', 'kill_boss']
      time_of_day?: string[]; // e.g., ['morning', 'night']
      locations?: string[]; // e.g., ['snow_mountain', 'cave', 'graveyard']
      weather?: string[]; // e.g., ['sunny', 'snowy']
      items?: Array<{ item_id: number; quantity?: number }>;
      events?: string[]; // Event types that give this Qi
      streak_days?: number; // Consecutive days required
    };
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
