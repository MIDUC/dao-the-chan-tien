import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../entities/character.entity';
import { EquipmentService } from '../equipment/equipment.service';
import { QiService } from '../qi/qi.service';
import { ElementsService } from '../elements/elements.service';
import { CharacterElement } from '../entities/character-element.entity';
import { CharacterQi } from '../entities/qi.entity';

/**
 * Primary Stats (Tầng Gốc) - Gắn với Fitness
 */
export interface PrimaryStats {
  luc_dao: number; // Lực Đạo - Sức Mạnh
  can_cot: number; // Căn Cốt - Thể Chất
  than_phap: number; // Thân Pháp - Nhanh Nhẹn
  ngo_tinh: number; // Ngộ Tính - Trí Tuệ
  dinh_luc: number; // Định Lực - Ý Chí
}

/**
 * Hidden Stats (Tầng Tiên Thiên)
 */
export interface HiddenStats {
  linh_can: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
  phuc_duyen: number; // 0-100
  tam_canh: number; // 0-100
}

/**
 * Combat Stats (Tầng Thực Chiến) - Calculated from Primary + Equipment + Realm
 */
export interface CombatStats {
  // Core Stats
  hp: number; // Sinh Lực - Health Points
  max_hp: number; // Max HP
  mp: number; // Linh Lực - Mana Points
  max_mp: number; // Max MP

  // Attack Stats
  physical_attack: number; // Vật Công
  magical_attack: number; // Pháp Công

  // Defense Stats
  physical_defense: number; // Vật Phòng
  magical_defense: number; // Pháp Phòng

  // Combat Modifiers
  critical_chance: number; // Bạo Kích - Critical Chance (%)
  critical_damage: number; // Critical Damage Multiplier
  speed: number; // Tốc Độ - Speed (for turn order)
  dodge: number; // Né Tránh - Dodge Chance (%)

  // Derived from Primary Stats
  attack_speed: number; // Tốc độ đánh
  carry_capacity: number; // Sức mang vác hành trang
}

/**
 * Complete Character Stats
 */
export interface CharacterStats {
  // Basic Info
  display_name: string;
  realm_level: number;
  exp: number;
  base_exp_per_interval: number;
  max_inventory_slots: number;
  last_login_at: Date | null;
  
  // Stats
  primary: PrimaryStats;
  hidden: HiddenStats;
  combat: CombatStats;
  
  // Elements
  elements: Array<{
    type: string;
    grade: string;
    level: number;
    exp: number;
  }>;
  
  // Qi
  qi: Array<{
    type: string;
    amount: number;
    max_amount: number;
    regen_rate: number;
  }>;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private equipmentService: EquipmentService,
    private qiService: QiService,
    private elementsService: ElementsService,
  ) {}

  /**
   * Get character's primary stats
   */
  async getPrimaryStats(characterId: number): Promise<PrimaryStats> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return {
      luc_dao: character.luc_dao,
      can_cot: character.can_cot,
      than_phap: character.than_phap,
      ngo_tinh: character.ngo_tinh,
      dinh_luc: character.dinh_luc,
    };
  }

  /**
   * Get character's hidden stats
   */
  async getHiddenStats(characterId: number): Promise<HiddenStats> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return {
      linh_can: character.linh_can,
      phuc_duyen: character.phuc_duyen,
      tam_canh: character.tam_canh,
    };
  }

  /**
   * Calculate combat stats from Primary Stats + Equipment + Realm Level
   */
  async calculateCombatStats(characterId: number): Promise<CombatStats> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const primary = await this.getPrimaryStats(characterId);
    const equipmentStats = await this.equipmentService.getTotalEquipmentStats(characterId);
    const qiStats = await this.qiService.calculateQiStats(characterId);

    // Base stats from Primary Stats
    const baseStats = {
      luc_dao: primary.luc_dao,
      can_cot: primary.can_cot,
      than_phap: primary.than_phap,
      ngo_tinh: primary.ngo_tinh,
      dinh_luc: primary.dinh_luc,
    };

    // Equipment bonuses (convert old strength/agility/wisdom to new system)
    const equipmentBonus = {
      luc_dao: equipmentStats.strength || 0,
      can_cot: equipmentStats.hp / 10 || 0, // HP from equipment contributes to constitution
      than_phap: equipmentStats.agility || 0,
      ngo_tinh: equipmentStats.wisdom || 0,
      dinh_luc: 0, // Equipment doesn't directly affect willpower
    };

    // Total stats
    const total = {
      luc_dao: baseStats.luc_dao + equipmentBonus.luc_dao,
      can_cot: baseStats.can_cot + equipmentBonus.can_cot,
      than_phap: baseStats.than_phap + equipmentBonus.than_phap,
      ngo_tinh: baseStats.ngo_tinh + equipmentBonus.ngo_tinh,
      dinh_luc: baseStats.dinh_luc + equipmentBonus.dinh_luc,
    };

    // Calculate Combat Stats using formulas
    const combat: CombatStats = {
      // HP = (Căn Cốt * 10) + (Cảnh Giới * 100) + Equipment HP
      max_hp: total.can_cot * 10 + character.realm_level * 100 + (equipmentStats.hp || 0),
      hp: 0, // Current HP (would be stored separately or calculated)

      // MP = (Ngộ Tính * 10) + (Cảnh Giới * 50)
      max_mp: total.ngo_tinh * 10 + character.realm_level * 50,
      mp: 0, // Current MP (would be stored separately or calculated)

      // Physical Attack = Lực Đạo * 2 + Equipment bonuses
      physical_attack: total.luc_dao * 2 + (equipmentStats.strength || 0),

      // Magical Attack = Ngộ Tính * 2 + Equipment bonuses
      magical_attack: total.ngo_tinh * 2 + (equipmentStats.wisdom || 0),

      // Physical Defense = Căn Cốt * 1.5 + Equipment Defense
      physical_defense: total.can_cot * 1.5 + (equipmentStats.defense || 0),

      // Magical Defense = Ngộ Tính * 1.5 + Equipment bonuses
      magical_defense: total.ngo_tinh * 1.5 + (equipmentStats.wisdom || 0) * 0.5,

      // Critical Chance = Thân Pháp * 0.5% (max 50%)
      critical_chance: Math.min(50, total.than_phap * 0.5) + (qiStats.crit_damage_bonus || 0),

      // Critical Damage = 2x base
      critical_damage: 2.0,

      // Speed = Thân Pháp * 2 (for turn order)
      speed: total.than_phap * 2,

      // Dodge = Thân Pháp * 0.3% (max 30%)
      dodge: Math.min(30, total.than_phap * 0.3),

      // Attack Speed = Thân Pháp * 0.1 (attacks per second)
      attack_speed: total.than_phap * 0.1,

      // Carry Capacity = Lực Đạo * 5 (inventory weight)
      carry_capacity: total.luc_dao * 5,
    };

    // Apply Qi bonuses
    if (qiStats.physical_resistance) {
      combat.physical_defense *= 1 + qiStats.physical_resistance / 100;
    }
    if (qiStats.magic_resistance) {
      combat.magical_defense *= 1 + qiStats.magic_resistance / 100;
    }

    return combat;
  }

  /**
   * Get complete character stats
   */
  async getCharacterStats(characterId: number): Promise<CharacterStats> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const primary = await this.getPrimaryStats(characterId);
    const hidden = await this.getHiddenStats(characterId);
    const combat = await this.calculateCombatStats(characterId);
    
    // Ensure all elements are initialized, then get them
    let elements: Array<{ type: string; grade: string; level: number; exp: number }> = [];
    try {
      await this.elementsService.initializeCharacterElements(characterId);
      const characterElements = await this.elementsService.getCharacterElements(characterId);
      console.log(`[StatsService] Character ${characterId} has ${characterElements.length} elements`);
      elements = characterElements.map(el => ({
        type: el.element_type,
        grade: el.grade,
        level: el.level,
        exp: el.exp,
      }));
    } catch (error) {
      console.error(`[StatsService] Error initializing/getting elements for character ${characterId}:`, error);
    }
    
    // Ensure all Qi are initialized, then get them
    let qi: Array<{ type: string; amount: number; max_amount: number; regen_rate: number }> = [];
    try {
      await this.qiService.initializeCharacterQi(characterId);
      const characterQi = await this.qiService.getCharacterQi(characterId);
      console.log(`[StatsService] Character ${characterId} has ${characterQi.length} qi types`);
      qi = characterQi.map(q => ({
        type: q.qi_type,
        amount: Number(q.amount),
        max_amount: Number(q.max_amount),
        regen_rate: Number(q.regen_rate),
      }));
    } catch (error) {
      console.error(`[StatsService] Error initializing/getting qi for character ${characterId}:`, error);
    }

    const result = {
      display_name: character.display_name,
      realm_level: character.realm_level,
      exp: character.exp,
      base_exp_per_interval: Number(character.base_exp_per_interval),
      max_inventory_slots: character.max_inventory_slots,
      last_login_at: character.last_login_at,
      primary,
      hidden,
      combat,
      elements,
      qi,
    };
    
    console.log(`[StatsService] Returning stats for character ${characterId}:`, {
      elementsCount: elements.length,
      qiCount: qi.length,
      hasElements: elements.length > 0,
      hasQi: qi.length > 0,
    });
    
    return result;
  }

  /**
   * Add primary stat points (from fitness activities)
   */
  async addPrimaryStat(
    characterId: number,
    statName: keyof PrimaryStats,
    amount: number,
  ): Promise<{ success: boolean; message: string; newValue: number }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return { success: false, message: 'Character not found', newValue: 0 };
    }

    const currentValue = character[statName];
    const newValue = currentValue + amount;
    character[statName] = newValue;

    // Update legacy stats for backward compatibility
    if (statName === 'luc_dao') {
      character.strength = newValue;
    } else if (statName === 'than_phap') {
      character.agility = newValue;
    } else if (statName === 'ngo_tinh') {
      character.wisdom = newValue;
    }

    await this.characterRepository.save(character);

    return {
      success: true,
      message: `Added ${amount} to ${statName}. New value: ${newValue}`,
      newValue,
    };
  }

  /**
   * Check for Tẩu Hỏa Nhập Ma (Qi Deviation)
   * Happens when EXP is high but Tâm Cảnh is low
   */
  async checkQiDeviation(characterId: number): Promise<{ hasDeviation: boolean; penalty: number }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return { hasDeviation: false, penalty: 0 };
    }

    // Calculate deviation risk
    // If EXP is high but Tâm Cảnh is low (< 30), risk of deviation
    const expLevel = character.exp / 10000; // Normalize EXP
    const tamCanhRatio = character.tam_canh / 100;

    // Deviation risk = (high EXP + low Tâm Cảnh) / 2
    const deviationRisk = (expLevel * (1 - tamCanhRatio)) / 2;

    if (deviationRisk > 0.5 && character.tam_canh < 30) {
      // Apply penalty: reduce all stats by 10-30%
      const penalty = Math.min(30, deviationRisk * 60);
      return { hasDeviation: true, penalty };
    }

    return { hasDeviation: false, penalty: 0 };
  }

  /**
   * Get Spirit Root bonus for activities
   * Different elements get different bonuses from different activities
   */
  getSpiritRootBonus(
    linhCan: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho',
    activityType: string,
  ): number {
    const bonuses: Record<string, Record<string, number>> = {
      kim: {
        // Metal element: benefits from strength training
        gym: 1.2,
        weight_lifting: 1.3,
        push_up: 1.1,
      },
      moc: {
        // Wood element: benefits from cardio
        running: 1.2,
        jogging: 1.3,
        jump_rope: 1.1,
      },
      thuy: {
        // Water element: benefits from meditation
        meditation: 1.3,
        yoga: 1.2,
        breathwork: 1.1,
      },
      hoa: {
        // Fire element: benefits from high-intensity
        cardio: 1.3,
        hiit: 1.2,
        sprint: 1.2,
      },
      tho: {
        // Earth element: balanced, benefits from all
        gym: 1.1,
        running: 1.1,
        meditation: 1.1,
      },
    };

    return bonuses[linhCan]?.[activityType] || 1.0;
  }
}

