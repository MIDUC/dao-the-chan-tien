import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../entities/character.entity';
import { StatsService } from '../stats/stats.service';
import { QiService } from '../qi/qi.service';
import { QiType } from '../entities/qi.entity';

/**
 * Fitness Activity Types
 */
export enum FitnessActivityType {
  // Strength activities -> Lực Đạo
  PUSH_UP = 'push_up',
  PULL_UP = 'pull_up',
  WEIGHT_LIFTING = 'weight_lifting',
  GYM = 'gym',

  // Constitution activities -> Căn Cốt
  PLANK = 'plank',
  SQUAT = 'squat',
  ABS = 'abs',
  CORE = 'core',

  // Agility activities -> Thân Pháp
  RUNNING = 'running',
  JOGGING = 'jogging',
  JUMP_ROPE = 'jump_rope',
  WALKING = 'walking',

  // Wisdom activities -> Ngộ Tính
  MEDITATION = 'meditation',
  FOCUS_TIME = 'focus_time',
  READING = 'reading',

  // Willpower activities -> Định Lực
  STREAK = 'streak', // Maintaining daily streak
  EARLY_WAKE = 'early_wake', // Waking up early
}

/**
 * Activity to Primary Stat mapping
 */
const ACTIVITY_TO_STAT: Record<FitnessActivityType, keyof { luc_dao: number; can_cot: number; than_phap: number; ngo_tinh: number; dinh_luc: number }> = {
  [FitnessActivityType.PUSH_UP]: 'luc_dao',
  [FitnessActivityType.PULL_UP]: 'luc_dao',
  [FitnessActivityType.WEIGHT_LIFTING]: 'luc_dao',
  [FitnessActivityType.GYM]: 'luc_dao',

  [FitnessActivityType.PLANK]: 'can_cot',
  [FitnessActivityType.SQUAT]: 'can_cot',
  [FitnessActivityType.ABS]: 'can_cot',
  [FitnessActivityType.CORE]: 'can_cot',

  [FitnessActivityType.RUNNING]: 'than_phap',
  [FitnessActivityType.JOGGING]: 'than_phap',
  [FitnessActivityType.JUMP_ROPE]: 'than_phap',
  [FitnessActivityType.WALKING]: 'than_phap',

  [FitnessActivityType.MEDITATION]: 'ngo_tinh',
  [FitnessActivityType.FOCUS_TIME]: 'ngo_tinh',
  [FitnessActivityType.READING]: 'ngo_tinh',

  [FitnessActivityType.STREAK]: 'dinh_luc',
  [FitnessActivityType.EARLY_WAKE]: 'dinh_luc',
};

/**
 * Activity to Qi Type mapping
 */
const ACTIVITY_TO_QI: Record<FitnessActivityType, QiType[]> = {
  [FitnessActivityType.PUSH_UP]: [QiType.BLOOD_QI],
  [FitnessActivityType.PULL_UP]: [QiType.BLOOD_QI],
  [FitnessActivityType.WEIGHT_LIFTING]: [QiType.BLOOD_QI],
  [FitnessActivityType.GYM]: [QiType.BLOOD_QI],

  [FitnessActivityType.PLANK]: [QiType.BLOOD_QI],
  [FitnessActivityType.SQUAT]: [QiType.BLOOD_QI],
  [FitnessActivityType.ABS]: [QiType.BLOOD_QI],
  [FitnessActivityType.CORE]: [QiType.BLOOD_QI],

  [FitnessActivityType.RUNNING]: [QiType.YANG_QI],
  [FitnessActivityType.JOGGING]: [QiType.YANG_QI],
  [FitnessActivityType.JUMP_ROPE]: [QiType.YANG_QI],
  [FitnessActivityType.WALKING]: [QiType.YANG_QI],

  [FitnessActivityType.MEDITATION]: [QiType.SPIRITUAL_QI],
  [FitnessActivityType.FOCUS_TIME]: [QiType.SPIRITUAL_QI, QiType.SCHOLARLY_QI],
  [FitnessActivityType.READING]: [QiType.SCHOLARLY_QI],

  [FitnessActivityType.STREAK]: [QiType.VITAL_QI],
  [FitnessActivityType.EARLY_WAKE]: [QiType.RIGHTEOUS_QI],
};

@Injectable()
export class FitnessService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private statsService: StatsService,
    private qiService: QiService,
  ) {}

  /**
   * Record fitness activity and award stats
   */
  async recordActivity(
    characterId: number,
    activityType: FitnessActivityType,
    quantity: number = 1,
    metadata?: any,
  ): Promise<{
    success: boolean;
    message: string;
    statsGained?: any;
    qiGained?: any;
  }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return { success: false, message: 'Character not found' };
    }

    // Get stat to increase
    const statName = ACTIVITY_TO_STAT[activityType];
    if (!statName) {
      return { success: false, message: `Invalid activity type: ${activityType}` };
    }

    // Calculate stat gain based on activity and quantity
    const baseGain = this.getBaseStatGain(activityType, quantity);
    
    // Apply Spirit Root bonus
    const spiritRootBonus = this.statsService.getSpiritRootBonus(
      character.linh_can,
      activityType,
    );
    const finalGain = Math.floor(baseGain * spiritRootBonus);

    // Add primary stat
    const statResult = await this.statsService.addPrimaryStat(
      characterId,
      statName,
      finalGain,
    );

    // Add Qi
    const qiTypes = ACTIVITY_TO_QI[activityType] || [];
    const qiResults: any[] = [];

    for (const qiType of qiTypes) {
      const qiAmount = this.getQiGain(activityType, qiType, quantity);
      const qiResult = await this.qiService.addQi(
        characterId,
        qiType,
        qiAmount,
        activityType,
      );
      qiResults.push({ qiType, amount: qiAmount, result: qiResult });
    }

    // Clear Impure Qi if doing fitness activities
    if (this.isPhysicalActivity(activityType)) {
      await this.qiService.clearImpureQi(characterId, activityType);
    }

    return {
      success: true,
      message: `Activity recorded: ${activityType} x${quantity}`,
      statsGained: {
        stat: statName,
        amount: finalGain,
        baseGain,
        spiritRootBonus,
      },
      qiGained: qiResults,
    };
  }

  /**
   * Get base stat gain for activity
   */
  private getBaseStatGain(activityType: FitnessActivityType, quantity: number): number {
    const baseGains: Record<FitnessActivityType, number> = {
      [FitnessActivityType.PUSH_UP]: 0.1, // 0.1 per push-up
      [FitnessActivityType.PULL_UP]: 0.2, // 0.2 per pull-up
      [FitnessActivityType.WEIGHT_LIFTING]: 0.5, // 0.5 per session
      [FitnessActivityType.GYM]: 1.0, // 1.0 per session

      [FitnessActivityType.PLANK]: 0.05, // 0.05 per second
      [FitnessActivityType.SQUAT]: 0.1, // 0.1 per squat
      [FitnessActivityType.ABS]: 0.1, // 0.1 per rep
      [FitnessActivityType.CORE]: 0.15, // 0.15 per exercise

      [FitnessActivityType.RUNNING]: 0.2, // 0.2 per km
      [FitnessActivityType.JOGGING]: 0.15, // 0.15 per km
      [FitnessActivityType.JUMP_ROPE]: 0.1, // 0.1 per 100 jumps
      [FitnessActivityType.WALKING]: 0.05, // 0.05 per km

      [FitnessActivityType.MEDITATION]: 0.3, // 0.3 per minute
      [FitnessActivityType.FOCUS_TIME]: 0.2, // 0.2 per hour
      [FitnessActivityType.READING]: 0.1, // 0.1 per hour

      [FitnessActivityType.STREAK]: 0.5, // 0.5 per day
      [FitnessActivityType.EARLY_WAKE]: 0.3, // 0.3 per day
    };

    return (baseGains[activityType] || 0.1) * quantity;
  }

  /**
   * Get Qi gain for activity
   */
  private getQiGain(
    activityType: FitnessActivityType,
    qiType: QiType,
    quantity: number,
  ): number {
    const qiGains: Record<string, number> = {
      [`${FitnessActivityType.PUSH_UP}_${QiType.BLOOD_QI}`]: 1,
      [`${FitnessActivityType.GYM}_${QiType.BLOOD_QI}`]: 10,
      [`${FitnessActivityType.RUNNING}_${QiType.YANG_QI}`]: 5,
      [`${FitnessActivityType.MEDITATION}_${QiType.SPIRITUAL_QI}`]: 5,
      [`${FitnessActivityType.READING}_${QiType.SCHOLARLY_QI}`]: 3,
      [`${FitnessActivityType.STREAK}_${QiType.VITAL_QI}`]: 1, // Very rare
      [`${FitnessActivityType.EARLY_WAKE}_${QiType.RIGHTEOUS_QI}`]: 2,
    };

    const key = `${activityType}_${qiType}`;
    return (qiGains[key] || 1) * quantity;
  }

  /**
   * Check if activity is physical (clears Impure Qi)
   */
  private isPhysicalActivity(activityType: FitnessActivityType): boolean {
    return [
      FitnessActivityType.PUSH_UP,
      FitnessActivityType.PULL_UP,
      FitnessActivityType.WEIGHT_LIFTING,
      FitnessActivityType.GYM,
      FitnessActivityType.PLANK,
      FitnessActivityType.SQUAT,
      FitnessActivityType.ABS,
      FitnessActivityType.CORE,
      FitnessActivityType.RUNNING,
      FitnessActivityType.JOGGING,
      FitnessActivityType.JUMP_ROPE,
      FitnessActivityType.WALKING,
    ].includes(activityType);
  }
}

