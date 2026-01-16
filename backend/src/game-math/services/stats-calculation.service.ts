import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../../entities/character.entity';
import { Equipment } from '../../entities/equipment.entity';
import { CharacterTalent } from '../../entities/character-talent.entity';
import { Talent } from '../../entities/talent.entity';
import { EffectType } from '../../entities/item-effect.entity';
import {
  BaseStats,
  FinalStats,
  StatsModifier,
  StatsCalculationResult,
} from '../types/stats-modifier.interface';
import {
  mergeStatsModifiers,
  calculateFinalStats,
  createZeroStats,
} from '../utils/stats-merger.util';

/**
 * Stats Calculation Service
 * 
 * Implements the 3-layer formula:
 * FinalStat = (Base + FlatBonus) × (1 + PercentBonus) + FinalFix
 * 
 * This service recalculates stats whenever:
 * - Character levels up
 * - Equipment is equipped/unequipped
 * - Talents are learned/upgraded
 * - Artifacts are equipped
 * - Temporary buffs are applied
 */
@Injectable()
export class StatsCalculationService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(CharacterTalent)
    private characterTalentRepository: Repository<CharacterTalent>,
    @InjectRepository(Talent)
    private talentRepository: Repository<Talent>,
  ) {}

  /**
   * Recalculate and update character stats
   * This is the main function to call whenever stats need to be refreshed
   */
  async refreshStats(characterId: number): Promise<FinalStats> {
    // 1. Load character with all relations
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
      relations: [],
    });

    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    // 2. Get base stats from character
    const baseStats = this.getBaseStats(character);

    // 3. Collect all modifiers
    const modifiers: StatsModifier[] = [];

    // Equipment modifiers (flat bonuses)
    const equipmentModifier = await this.getEquipmentModifier(characterId);
    if (equipmentModifier) {
      modifiers.push(equipmentModifier);
    }

    // Talent modifiers (multiplier bonuses)
    const talentModifier = await this.getTalentModifier(characterId);
    if (talentModifier) {
      modifiers.push(talentModifier);
    }

    // Artifact modifiers (can be both flat and mult)
    // TODO: Implement when artifacts are ready
    // const artifactModifier = await this.getArtifactModifier(characterId);
    // if (artifactModifier) {
    //   modifiers.push(artifactModifier);
    // }

    // Temporary buff modifiers
    // TODO: Implement when buff system is ready
    // const buffModifier = await this.getBuffModifier(characterId);
    // if (buffModifier) {
    //   modifiers.push(buffModifier);
    // }

    // 4. Merge all modifiers
    const mergedModifier = mergeStatsModifiers(modifiers);

    // 5. Calculate final stats
    const finalStats = calculateFinalStats(baseStats, mergedModifier);

    // 6. Save to database (cache)
    await this.saveFinalStats(characterId, finalStats);

    return finalStats;
  }

  /**
   * Get base stats from character entity
   */
  private getBaseStats(character: Character): BaseStats {
    // Get base stats from character entity
    // If character has baseStats JSON field, use it
    // Otherwise, calculate from realm level and primary stats
    const baseStats: BaseStats = {
      atk: character.luc_dao || 0,
      def: character.can_cot || 0,
      hp: 100 + (character.realm_level || 0) * 10, // Base HP + realm bonus
      mp: 50 + (character.realm_level || 0) * 5, // Base MP + realm bonus
      crit: 5, // Base 5% crit
      critDmg: 150, // Base 150% crit damage
      dodge: 2, // Base 2% dodge
      accuracy: 95, // Base 95% accuracy
    };

    return baseStats;
  }

  /**
   * Get equipment modifier (flat bonuses)
   */
  private async getEquipmentModifier(
    characterId: number,
  ): Promise<StatsModifier | null> {
    const equipments = await this.equipmentRepository.find({
      where: { character_id: characterId },
      relations: ['item', 'item.effects'],
    });

    if (equipments.length === 0) {
      return null;
    }

    const flatBonus: Partial<BaseStats> = {};

    for (const equipment of equipments) {
      if (!equipment.item?.effects) continue;

      for (const effect of equipment.item.effects) {
        // Parse effect and add to flat bonus
        // Use STAT_INCREASE effect type with stat_type and amount
        if (effect.effect_type === EffectType.STAT_INCREASE && effect.effect_value) {
          const statType = effect.effect_value.stat_type;
          const amount = effect.effect_value.amount || 0;
          
          // Map stat_type to BaseStats
          if (statType === 'strength' || statType === 'atk' || statType === 'physical_attack') {
            flatBonus.atk = (flatBonus.atk || 0) + amount;
          } else if (statType === 'defense' || statType === 'def' || statType === 'physical_defense') {
            flatBonus.def = (flatBonus.def || 0) + amount;
          } else if (statType === 'hp' || statType === 'health') {
            flatBonus.hp = (flatBonus.hp || 0) + amount;
          } else if (statType === 'mp' || statType === 'mana') {
            flatBonus.mp = (flatBonus.mp || 0) + amount;
          }
        }
        // Note: Equipment stats are also in equipment.item.stats, which should be handled separately
      }
    }

    return { flat: flatBonus };
  }

  /**
   * Get talent modifier (multiplier bonuses)
   */
  private async getTalentModifier(
    characterId: number,
  ): Promise<StatsModifier | null> {
    const characterTalents = await this.characterTalentRepository.find({
      where: { character_id: characterId },
      relations: ['talent'],
    });

    if (characterTalents.length === 0) {
      return null;
    }

    const multBonus: Partial<BaseStats> = {};

    for (const charTalent of characterTalents) {
      const talent = charTalent.talent;
      if (!talent) continue;

      // Parse talent stats
      // This is a simplified version - adjust based on your Talent structure
      // Assuming talent has a stats JSON field with multipliers
      const talentStats = (talent as any).stats;
      if (talentStats) {
        if (talentStats.atkMultiplier) {
          multBonus.atk = (multBonus.atk || 0) + talentStats.atkMultiplier;
        }
        if (talentStats.defMultiplier) {
          multBonus.def = (multBonus.def || 0) + talentStats.defMultiplier;
        }
        // Add more stat types as needed
      }
    }

    return { mult: multBonus };
  }

  /**
   * Save final stats to character entity
   */
  private async saveFinalStats(
    characterId: number,
    finalStats: FinalStats,
  ): Promise<void> {
    await this.characterRepository.update(characterId, {
      // Store final stats in a JSON field
      // You may need to add this field to Character entity
      finalStats: finalStats as any,
    });
  }

  /**
   * Get detailed calculation result (for debugging/admin)
   */
  async getCalculationDetails(
    characterId: number,
  ): Promise<StatsCalculationResult> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    const baseStats = this.getBaseStats(character);
    const equipmentModifier = await this.getEquipmentModifier(characterId);
    const talentModifier = await this.getTalentModifier(characterId);

    const modifiers: StatsModifier[] = [];
    if (equipmentModifier) modifiers.push(equipmentModifier);
    if (talentModifier) modifiers.push(talentModifier);

    const mergedModifier = mergeStatsModifiers(modifiers);
    const finalStats = calculateFinalStats(baseStats, mergedModifier);

    return {
      base: baseStats,
      flatBonus: mergedModifier.flat ? { ...createZeroStats(), ...mergedModifier.flat } : createZeroStats(),
      percentBonus: mergedModifier.mult || {},
      finalStats,
    };
  }
}

