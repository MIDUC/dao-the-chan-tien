import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../entities/character.entity';
import { Equipment } from '../entities/equipment.entity';
import { CharacterSkill } from '../entities/character-skill.entity';
import { CharacterAchievement } from '../entities/character-achievement.entity';
import { ItemEffect, EffectType } from '../entities/item-effect.entity';
import { SystemConfigService } from '../system-config/system-config.service';
import {
  getRealmBreakthroughExpBoost,
  getBreakthroughRealm,
} from '../utils/realm.util';

@Injectable()
export class OfflineCultivationService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(CharacterSkill)
    private characterSkillRepository: Repository<CharacterSkill>,
    @InjectRepository(CharacterAchievement)
    private characterAchievementRepository: Repository<CharacterAchievement>,
    @InjectRepository(ItemEffect)
    private itemEffectRepository: Repository<ItemEffect>,
    @Inject(forwardRef(() => SystemConfigService))
    private configService: SystemConfigService,
  ) {}

  /**
   * Calculate offline EXP rate multiplier
   * Base rate: 10 EXP per hour
   * Multipliers from:
   * - Realm level (higher realm = higher base rate)
   * - Equipped items with EXP rate boost
   * - Skills (cultivation category) with EXP rate boost
   * - Achievements (titles) with EXP rate boost
   */
  async calculateOfflineExpRate(characterId: number): Promise<{
    baseRate: number; // EXP per hour
    multipliers: {
      realm: number;
      items: number;
      skills: number;
      achievements: number;
    };
    totalRate: number; // Final EXP per hour
  }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    // Base EXP per interval: từ character.base_exp_per_interval (mỗi user có riêng)
    // Convert to per hour: base_exp_per_interval * (3600 / interval_seconds)
    const cultivationInterval = await this.configService.getConfigNumber(
      'cultivation_interval_seconds',
      60,
    );
    const intervalsPerHour = 3600 / cultivationInterval;
    const baseRate =
      Number(character.base_exp_per_interval || 10) * intervalsPerHour;

    // Realm multiplier (1.0 = no bonus, higher = more bonus)
    // Chỉ hiển thị, không cộng vào base
    const realmMultiplier = 1.0 + character.realm_level * 0.05;

    // Get equipped items with EXP rate boost
    const equippedItems = await this.equipmentRepository.find({
      where: { character_id: characterId },
      relations: ['item', 'item.effects'],
    });

    let itemMultiplier = 1.0;
    for (const equipment of equippedItems) {
      if (equipment.item?.effects) {
        for (const effect of equipment.item.effects) {
          if (effect.effect_type === EffectType.EXP_BOOST) {
            const percentage = effect.effect_value?.percentage || 0;
            itemMultiplier += percentage / 100;
          }
        }
      }
    }

    // Get unlocked cultivation skills with EXP rate boost
    const cultivationSkills = await this.characterSkillRepository.find({
      where: {
        character_id: characterId,
        is_unlocked: true,
      },
      relations: ['skill'],
    });

    let skillMultiplier = 1.0;
    // Note: Skill entity doesn't have category or effects properties
    // If needed, these should be added to the Skill entity or stored differently
    // For now, skill multiplier is set to 1.0 (no bonus from skills)
    // TODO: Implement skill effects system if needed

    // Get achievements with EXP rate boost (from titles)
    const achievements = await this.characterAchievementRepository.find({
      where: {
        character_id: characterId,
        is_unlocked: true,
      },
      relations: ['achievement'],
    });

    let achievementMultiplier = 1.0;
    for (const charAchievement of achievements) {
      const achievement = charAchievement.achievement;
      if (achievement?.rewards?.title) {
        // Check if achievement has EXP rate boost
        // This would be stored in achievement metadata or conditions
        // For now, we'll use rarity as a multiplier
        const rarityBonus = (achievement.rarity - 1) * 0.02; // 0-8% bonus based on rarity
        achievementMultiplier += rarityBonus;
      }
    }

    // Total rate = base * multipliers (chỉ để hiển thị, không dùng để tính EXP thực tế)
    const totalRate =
      baseRate *
      realmMultiplier *
      itemMultiplier *
      skillMultiplier *
      achievementMultiplier;

    return {
      baseRate,
      multipliers: {
        realm: realmMultiplier,
        items: itemMultiplier,
        skills: skillMultiplier,
        achievements: achievementMultiplier,
      },
      totalRate: Math.floor(totalRate), // Chỉ để hiển thị trong UI
    };
  }

  /**
   * Calculate offline EXP based on time offline
   * @param characterId Character ID
   * @returns Offline EXP amount and time offline in seconds
   */
  async calculateOfflineExp(characterId: number): Promise<{
    exp: number;
    hoursOffline: number;
    secondsOffline: number;
  }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    // If never logged in before, use creation time
    const lastLogin = character.last_login_at || character.created_at;
    const now = new Date();
    const secondsOffline = Math.floor(
      (now.getTime() - lastLogin.getTime()) / 1000,
    );

    // Maximum offline time: 7 days (604800 seconds)
    const maxOfflineSeconds = 7 * 24 * 60 * 60;
    const cappedSeconds = Math.min(secondsOffline, maxOfflineSeconds);

    const hoursOffline = cappedSeconds / 3600;

    // Calculate EXP rate
    const { totalRate } = await this.calculateOfflineExpRate(characterId);

    // Calculate EXP: rate per hour * hours offline
    const exp = Math.floor(totalRate * hoursOffline);

    return {
      exp,
      hoursOffline,
      secondsOffline: cappedSeconds,
    };
  }

  /**
   * Claim offline EXP
   * Updates character EXP and last_login_at
   */
  async claimOfflineExp(characterId: number): Promise<{
    success: boolean;
    expGained: number;
    hoursOffline: number;
  }> {
    const { exp, hoursOffline } = await this.calculateOfflineExp(characterId);

    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    // Add EXP
    character.exp += exp;
    character.last_login_at = new Date();
    await this.characterRepository.save(character);

    // Check for level up
    const expRequired = Math.floor(1000 * Math.pow(character.realm_level, 1.5));
    if (character.exp >= expRequired) {
      // Level up logic would go here
      // For now, just update realm_level
      // TODO: Implement proper level up system
    }

    return {
      success: true,
      expGained: exp,
      hoursOffline,
    };
  }

  /**
   * Get offline cultivation info without claiming
   */
  async getOfflineCultivationInfo(characterId: number): Promise<{
    baseExpPerInterval: number;
    multipliers: {
      realm: number;
      items: number;
      skills: number;
      achievements: number;
    };
    lastCultivationTime: Date | null; // Thời gian lần cuối cộng EXP
    timeUntilNextExp: number; // Số giây còn lại đến lần cộng EXP tiếp theo (0-100%)
  }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    const { multipliers } = await this.calculateOfflineExpRate(characterId);
    const cultivationInterval = await this.configService.getConfigNumber(
      'cultivation_interval_seconds',
      60,
    );

    // Calculate time until next EXP gain
    const lastUpdate = character.last_login_at;
    let timeUntilNextExp = 0;

    if (lastUpdate) {
      const now = new Date();
      const secondsPassed = Math.floor(
        (now.getTime() - lastUpdate.getTime()) / 1000,
      );
      const secondsUntilNext =
        cultivationInterval - (secondsPassed % cultivationInterval);
      // Convert to percentage (0-100%)
      timeUntilNextExp = (secondsUntilNext / cultivationInterval) * 100;
    } else {
      timeUntilNextExp = 100; // Chưa có last_login_at, hiển thị 100%
    }

    return {
      baseExpPerInterval: Number(character.base_exp_per_interval || 10),
      multipliers,
      lastCultivationTime: character.last_login_at,
      timeUntilNextExp: Math.max(0, Math.min(100, timeUntilNextExp)), // Clamp 0-100
    };
  }

  /**
   * Process passive cultivation (auto-add EXP continuously while user is online)
   * This should be called periodically (via scheduler) to add EXP for online users
   * @param characterId Character ID
   * @returns EXP gained and whether character was updated
   */
  async processPassiveCultivation(characterId: number): Promise<{
    expGained: number;
    updated: boolean;
  }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return { expGained: 0, updated: false };
    }

    // Check if user is online (has last_login_at set)
    // If last_login_at is null, user never logged in, don't give EXP
    const lastUpdate = character.last_login_at;
    if (!lastUpdate) {
      // User never logged in, don't give EXP
      return { expGained: 0, updated: false };
    }

    const now = new Date();
    const secondsPassed = Math.floor(
      (now.getTime() - lastUpdate.getTime()) / 1000,
    );

    // Get cultivation interval from config (default: 60 seconds = 1 minute)
    const cultivationInterval = await this.configService.getConfigNumber(
      'cultivation_interval_seconds',
      60,
    );

    // Only process if enough time has passed since last update
    // This ensures we add EXP at the correct interval
    if (secondsPassed < cultivationInterval) {
      return { expGained: 0, updated: false };
    }

    // Calculate EXP gained: base_exp_per_interval * number of intervals passed
    // Note: We cap the intervals to prevent huge EXP gains if user was offline for a long time
    // Maximum: process up to 1 interval per scheduler run (every minute)
    const intervalsPassed = Math.min(
      1,
      Math.floor(secondsPassed / cultivationInterval),
    );

    if (intervalsPassed < 1) {
      return { expGained: 0, updated: false };
    }

    // EXP gained = base_exp_per_interval * intervals (không nhân với multipliers)
    const baseExpPerInterval = Number(character.base_exp_per_interval || 10);
    const expGained = baseExpPerInterval * intervalsPassed;

    if (expGained > 0) {
      // Add EXP
      const oldExp = character.exp;
      character.exp += expGained;

      // Update last_login_at to track when we last processed cultivation
      // This ensures continuous EXP gain while online
      // Note: We update to the time when we processed, not "now", to maintain interval accuracy
      const newLastUpdate = new Date(
        lastUpdate.getTime() + intervalsPassed * cultivationInterval * 1000,
      );
      character.last_login_at = newLastUpdate;

      // Don't auto level up - user must manually breakthrough
      // Exp will be checked and displayed in frontend
      // Breakthrough will be handled by RealmLevelsService

      await this.characterRepository.save(character);

      // Log EXP gain for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Character ${character.id}: +${expGained.toFixed(2)} EXP (${oldExp.toFixed(2)} → ${character.exp.toFixed(2)})`,
        );
      }

      return { expGained, updated: true };
    }

    return { expGained: 0, updated: false };
  }
}
