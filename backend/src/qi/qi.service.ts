import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CharacterQi, QiType, QiCategory, QiEffect } from '../entities/qi.entity';
import { Character } from '../entities/character.entity';

export interface QiStats {
  hp_regen_per_second: number;
  mp_regen_per_second: number;
  physical_resistance: number;
  magic_resistance: number;
  skill_learning_speed: number;
  npc_price_reduction: number;
  debuff_resistance: number;
  crit_damage_bonus: number;
  fear_chance: number;
  stealth_bonus: number;
  soul_damage_bonus: number;
  slow_chance: number;
  freeze_chance: number;
  burn_chance: number;
  cultivation_speed_penalty: number;
}

@Injectable()
export class QiService {
  constructor(
    @InjectRepository(CharacterQi)
    private characterQiRepository: Repository<CharacterQi>,
    @InjectRepository(QiEffect)
    private qiEffectRepository: Repository<QiEffect>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  /**
   * Initialize Qi for a new character
   */
  async initializeCharacterQi(characterId: number): Promise<CharacterQi[]> {
    const qiTypes = Object.values(QiType);
    const qiEntries: CharacterQi[] = [];

    for (const qiType of qiTypes) {
      const existing = await this.characterQiRepository.findOne({
        where: { character_id: characterId, qi_type: qiType },
      });

      if (!existing) {
        const qi = this.characterQiRepository.create({
          character_id: characterId,
          qi_type: qiType,
          amount: 0,
          max_amount: this.getDefaultMaxAmount(qiType),
          regen_rate: this.getDefaultRegenRate(qiType),
          metadata: this.getDefaultMetadata(qiType),
        });
        qiEntries.push(await this.characterQiRepository.save(qi));
      }
    }

    return qiEntries;
  }

  /**
   * Get character's Qi
   */
  async getCharacterQi(characterId: number): Promise<CharacterQi[]> {
    return this.characterQiRepository.find({
      where: { character_id: characterId },
      order: { qi_type: 'ASC' },
    });
  }

  /**
   * Get specific Qi type for character
   */
  async getQi(characterId: number, qiType: QiType): Promise<CharacterQi | null> {
    return this.characterQiRepository.findOne({
      where: { character_id: characterId, qi_type: qiType },
    });
  }

  /**
   * Add Qi to character
   */
  async addQi(
    characterId: number,
    qiType: QiType,
    amount: number,
    source?: string,
  ): Promise<{ success: boolean; message: string; newAmount?: number }> {
    let qi = await this.getQi(characterId, qiType);

    if (!qi) {
      // Initialize if doesn't exist
      qi = this.characterQiRepository.create({
        character_id: characterId,
        qi_type: qiType,
        amount: 0,
        max_amount: this.getDefaultMaxAmount(qiType),
        regen_rate: this.getDefaultRegenRate(qiType),
        metadata: this.getDefaultMetadata(qiType),
      });
    }

    const oldAmount = Number(qi.amount);
    const maxAmount = Number(qi.max_amount);
    const newAmount = Math.min(oldAmount + amount, maxAmount);
    qi.amount = newAmount;

    // Update metadata based on source
    if (source) {
      await this.updateMetadataFromSource(qi, source, amount);
    }

    await this.characterQiRepository.save(qi);

    return {
      success: true,
      message: `Added ${amount} ${qiType}. New amount: ${newAmount}/${maxAmount}`,
      newAmount,
    };
  }

  /**
   * Consume Qi from character
   */
  async consumeQi(
    characterId: number,
    qiType: QiType,
    amount: number,
  ): Promise<{ success: boolean; message: string; remaining?: number }> {
    const qi = await this.getQi(characterId, qiType);

    if (!qi || Number(qi.amount) < amount) {
      return { success: false, message: `Not enough ${qiType}` };
    }

    qi.amount = Number(qi.amount) - amount;
    await this.characterQiRepository.save(qi);

    return {
      success: true,
      message: `Consumed ${amount} ${qiType}`,
      remaining: Number(qi.amount),
    };
  }

  /**
   * Calculate total stats from all active Qi
   */
  async calculateQiStats(characterId: number): Promise<QiStats> {
    const allQi = await this.getCharacterQi(characterId);
    const stats: QiStats = {
      hp_regen_per_second: 0,
      mp_regen_per_second: 0,
      physical_resistance: 0,
      magic_resistance: 0,
      skill_learning_speed: 1,
      npc_price_reduction: 0,
      debuff_resistance: 0,
      crit_damage_bonus: 0,
      fear_chance: 0,
      stealth_bonus: 0,
      soul_damage_bonus: 0,
      slow_chance: 0,
      freeze_chance: 0,
      burn_chance: 0,
      cultivation_speed_penalty: 0,
    };

    for (const qi of allQi) {
      if (Number(qi.amount) <= 0) continue;

      const effect = await this.qiEffectRepository.findOne({
        where: { qi_type: qi.qi_type },
      });

      if (!effect || !effect.effects.passive) continue;

      const passive = effect.effects.passive;
      const qiAmount = Number(qi.amount);
      const maxAmount = Number(qi.max_amount);
      const ratio = qiAmount / maxAmount; // 0-1 ratio

      // Apply passive effects scaled by Qi amount
      if (passive.hp_regen_per_second) {
        stats.hp_regen_per_second += passive.hp_regen_per_second * ratio;
      }
      if (passive.mp_regen_per_second) {
        stats.mp_regen_per_second += passive.mp_regen_per_second * ratio;
      }
      if (passive.physical_resistance) {
        stats.physical_resistance += passive.physical_resistance * ratio;
      }
      if (passive.magic_resistance) {
        stats.magic_resistance += passive.magic_resistance * ratio;
      }
      if (passive.skill_learning_speed) {
        stats.skill_learning_speed *= 1 + (passive.skill_learning_speed * ratio) / 100;
      }
      if (passive.npc_price_reduction) {
        stats.npc_price_reduction += passive.npc_price_reduction * ratio;
      }
      if (passive.debuff_resistance) {
        stats.debuff_resistance += passive.debuff_resistance * ratio;
      }
      if (passive.crit_damage_bonus) {
        stats.crit_damage_bonus += passive.crit_damage_bonus * ratio;
      }
      if (passive.fear_chance) {
        stats.fear_chance += passive.fear_chance * ratio;
      }
      if (passive.stealth_bonus) {
        stats.stealth_bonus += passive.stealth_bonus * ratio;
      }
      if (passive.soul_damage_bonus) {
        stats.soul_damage_bonus += passive.soul_damage_bonus * ratio;
      }
      if (passive.slow_chance) {
        stats.slow_chance += passive.slow_chance * ratio;
      }
      if (passive.freeze_chance) {
        stats.freeze_chance += passive.freeze_chance * ratio;
      }
      if (passive.burn_chance) {
        stats.burn_chance += passive.burn_chance * ratio;
      }
      if (passive.cultivation_speed_penalty) {
        stats.cultivation_speed_penalty += passive.cultivation_speed_penalty * ratio;
      }
    }

    return stats;
  }

  /**
   * Process Qi regeneration (called periodically)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processQiRegeneration(): Promise<void> {
    const allCharacterQi = await this.characterQiRepository.find({
      relations: ['character'],
    });

    const now = new Date();

    for (const qi of allCharacterQi) {
      if (Number(qi.regen_rate) <= 0) continue;

      const lastRegen = qi.last_regen_at ? new Date(qi.last_regen_at) : qi.created_at;
      const secondsSinceLastRegen = (now.getTime() - lastRegen.getTime()) / 1000;

      if (secondsSinceLastRegen >= 60) {
        // Regenerate every minute
        const regenAmount = Number(qi.regen_rate) * (secondsSinceLastRegen / 60);
        const currentAmount = Number(qi.amount);
        const maxAmount = Number(qi.max_amount);
        qi.amount = Math.min(currentAmount + regenAmount, maxAmount);
        qi.last_regen_at = now;
        await this.characterQiRepository.save(qi);
      }
    }
  }

  /**
   * Process Impure Qi accumulation (if inactive for 24h)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processImpureQi(): Promise<void> {
    const characters = await this.characterRepository.find();

    for (const character of characters) {
      const impureQi = await this.getQi(character.id, QiType.IMPURE_QI);
      if (!impureQi) continue;

      const lastActivity = impureQi.metadata?.last_activity_at
        ? new Date(impureQi.metadata.last_activity_at)
        : character.last_login_at || character.created_at;

      const hoursSinceActivity = (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

      if (hoursSinceActivity >= 24) {
        // Accumulate Impure Qi
        const accumulationRate = 10; // Per hour after 24h
        const hoursOver24 = hoursSinceActivity - 24;
        const newImpureAmount = Math.min(
          Number(impureQi.amount) + accumulationRate * hoursOver24,
          Number(impureQi.max_amount),
        );

        impureQi.amount = newImpureAmount;
        await this.characterQiRepository.save(impureQi);
      }
    }
  }

  /**
   * Clear Impure Qi through fitness activities
   */
  async clearImpureQi(characterId: number, activityType: string): Promise<{ success: boolean; cleared: number }> {
    const impureQi = await this.getQi(characterId, QiType.IMPURE_QI);
    if (!impureQi || Number(impureQi.amount) <= 0) {
      return { success: false, cleared: 0 };
    }

    // Different activities clear different amounts
    const clearRates: Record<string, number> = {
      gym: 50,
      weight_lifting: 50,
      squat: 50,
      running: 30,
      push_up: 20,
      meditation: 10,
      yoga: 10,
      breathwork: 10,
    };

    const clearAmount = clearRates[activityType] || 10;
    const currentAmount = Number(impureQi.amount);
    const cleared = Math.min(clearAmount, currentAmount);

    impureQi.amount = currentAmount - cleared;
    impureQi.metadata = {
      ...impureQi.metadata,
      last_activity_at: new Date(),
    };

    await this.characterQiRepository.save(impureQi);

    return { success: true, cleared };
  }

  /**
   * Activate Berserk mode (Demonic Qi)
   */
  async activateBerserk(characterId: number): Promise<{ success: boolean; message: string }> {
    const demonicQi = await this.getQi(characterId, QiType.DEMONIC_QI);
    if (!demonicQi || Number(demonicQi.amount) < 100) {
      return { success: false, message: 'Not enough Demonic Qi (need 100)' };
    }

    const effect = await this.qiEffectRepository.findOne({
      where: { qi_type: QiType.DEMONIC_QI },
    });

    if (!effect || !effect.effects.active?.berserk) {
      return { success: false, message: 'Berserk effect not configured' };
    }

    const berserk = effect.effects.active.berserk;
    demonicQi.metadata = {
      ...demonicQi.metadata,
      berserk_active: true,
      berserk_duration: berserk.duration || 60,
      berserk_started_at: new Date(),
    };

    await this.characterQiRepository.save(demonicQi);

    return {
      success: true,
      message: `Berserk activated for ${berserk.duration || 60} seconds`,
    };
  }

  /**
   * Process Berserk HP drain
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async processBerserkDrain(): Promise<void> {
    const allDemonicQi = await this.characterQiRepository.find({
      where: { qi_type: QiType.DEMONIC_QI },
      relations: ['character'],
    });

    for (const qi of allDemonicQi) {
      if (!qi.metadata?.berserk_active) continue;

      const startedAt = qi.metadata.berserk_started_at
        ? new Date(qi.metadata.berserk_started_at)
        : new Date();
      const duration = qi.metadata.berserk_duration || 60;
      const elapsed = (new Date().getTime() - startedAt.getTime()) / 1000;

      if (elapsed >= duration) {
        // Deactivate berserk
        qi.metadata.berserk_active = false;
        await this.characterQiRepository.save(qi);
        continue;
      }

      // Drain HP (would need to integrate with character HP system)
      // For now, just track the drain
    }
  }

  /**
   * Update metadata from source
   */
  private async updateMetadataFromSource(qi: CharacterQi, source: string, amount: number): Promise<void> {
    switch (qi.qi_type) {
      case QiType.KILLING_QI:
        qi.metadata = {
          ...qi.metadata,
          kill_count: (qi.metadata?.kill_count || 0) + 1,
        };
        break;
      case QiType.RIGHTEOUS_QI:
        qi.metadata = {
          ...qi.metadata,
          good_deed_count: (qi.metadata?.good_deed_count || 0) + 1,
        };
        break;
      case QiType.SCHOLARLY_QI:
        qi.metadata = {
          ...qi.metadata,
          knowledge_points: (qi.metadata?.knowledge_points || 0) + amount,
        };
        break;
      case QiType.IMPURE_QI:
        // Reset last activity when clearing
        qi.metadata = {
          ...qi.metadata,
          last_activity_at: new Date(),
        };
        break;
    }
  }

  /**
   * Get default max amount for Qi type
   */
  private getDefaultMaxAmount(qiType: QiType): number {
    const defaults: Record<QiType, number> = {
      [QiType.BLOOD_QI]: 10000,
      [QiType.SPIRITUAL_QI]: 10000,
      [QiType.VITAL_QI]: 1000, // Very rare
      [QiType.RIGHTEOUS_QI]: 5000,
      [QiType.KILLING_QI]: 5000,
      [QiType.SCHOLARLY_QI]: 5000,
      [QiType.DEMONIC_QI]: 5000,
      [QiType.FROST_QI]: 3000,
      [QiType.YANG_QI]: 3000,
      [QiType.YIN_QI]: 3000,
      [QiType.IMPURE_QI]: 10000,
      [QiType.PRENATAL_QI]: 500, // Very rare
      [QiType.GRANDMIST_PURPLE_QI]: 100, // Extremely rare
      [QiType.CHAOS_QI]: 1000,
      [QiType.IMPERIAL_QI]: 2000,
      [QiType.AURA_QI]: 5000,
      [QiType.CORPSE_QI]: 3000,
      [QiType.DEATH_QI]: 5000, // Tử Khí
      [QiType.RESENTMENT_QI]: 3000, // Oán Khí
      [QiType.CHARM_QI]: 2000, // Mị Khí
    };
    return defaults[qiType] || 1000;
  }

  /**
   * Get default regen rate for Qi type
   */
  private getDefaultRegenRate(qiType: QiType): number {
    const defaults: Record<QiType, number> = {
      [QiType.BLOOD_QI]: 1, // 1 per minute
      [QiType.SPIRITUAL_QI]: 1,
      [QiType.VITAL_QI]: 0, // No auto regen
      [QiType.RIGHTEOUS_QI]: 0.1,
      [QiType.KILLING_QI]: 0,
      [QiType.SCHOLARLY_QI]: 0.2,
      [QiType.DEMONIC_QI]: 0,
      [QiType.FROST_QI]: 0,
      [QiType.YANG_QI]: 0.5,
      [QiType.YIN_QI]: 0,
      [QiType.IMPURE_QI]: 0, // Only accumulates from inactivity
      [QiType.PRENATAL_QI]: 0,
      [QiType.GRANDMIST_PURPLE_QI]: 0,
      [QiType.CHAOS_QI]: 0,
      [QiType.IMPERIAL_QI]: 0.1,
      [QiType.AURA_QI]: 2, // Shield regens faster
      [QiType.CORPSE_QI]: 0,
      [QiType.DEATH_QI]: 0, // Tử Khí - no regen
      [QiType.RESENTMENT_QI]: 0, // Oán Khí - no regen
      [QiType.CHARM_QI]: 0.1, // Mị Khí - slow regen
    };
    return defaults[qiType] || 0;
  }

  /**
   * Get default metadata for Qi type
   */
  private getDefaultMetadata(qiType: QiType): any {
    const defaults: Partial<Record<QiType, any>> = {
      [QiType.IMPURE_QI]: { last_activity_at: new Date() },
      [QiType.DEMONIC_QI]: { berserk_active: false },
      [QiType.AURA_QI]: { shield_active: false, shield_amount: 0 },
      [QiType.CORPSE_QI]: { poison_stack: 0 },
      [QiType.KILLING_QI]: { kill_count: 0 },
      [QiType.RIGHTEOUS_QI]: { good_deed_count: 0 },
      [QiType.SCHOLARLY_QI]: { knowledge_points: 0 },
      [QiType.DEATH_QI]: { death_count: 0 },
      [QiType.RESENTMENT_QI]: { revenge_target: null },
      [QiType.CHARM_QI]: { charm_level: 0 },
    };
    return defaults[qiType] || {};
  }
}

