import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { CharacterAchievement } from '../entities/character-achievement.entity';
import { Character } from '../entities/character.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(CharacterAchievement)
    private characterAchievementRepository: Repository<CharacterAchievement>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  /**
   * Get all achievements
   */
  async findAll(): Promise<Achievement[]> {
    return this.achievementRepository.find({
      where: { is_active: true },
      order: { rarity: 'DESC', id: 'ASC' },
    });
  }

  /**
   * Get achievement by ID
   */
  async findOne(id: number): Promise<Achievement | null> {
    return this.achievementRepository.findOne({
      where: { id, is_active: true },
    });
  }

  /**
   * Get character achievements
   */
  async getCharacterAchievements(characterId: number): Promise<CharacterAchievement[]> {
    return this.characterAchievementRepository.find({
      where: { character_id: characterId },
      relations: ['achievement'],
    });
  }

  /**
   * Check and unlock achievement for character
   */
  async checkAndUnlockAchievement(
    characterId: number,
    achievementId: number,
  ): Promise<{ unlocked: boolean; characterAchievement: CharacterAchievement | null }> {
    // Check if already unlocked
    const existing = await this.characterAchievementRepository.findOne({
      where: { character_id: characterId, achievement_id: achievementId },
    });

    if (existing && existing.is_unlocked) {
      return { unlocked: false, characterAchievement: existing };
    }

    const achievement = await this.findOne(achievementId);
    if (!achievement) {
      return { unlocked: false, characterAchievement: null };
    }

    // Create or update character achievement
    let characterAchievement = existing;
    if (!characterAchievement) {
      characterAchievement = this.characterAchievementRepository.create({
        character_id: characterId,
        achievement_id: achievementId,
        is_unlocked: true,
        unlocked_at: new Date(),
        reward_claimed: false,
      });
    } else {
      characterAchievement.is_unlocked = true;
      characterAchievement.unlocked_at = new Date();
    }

    const saved = await this.characterAchievementRepository.save(characterAchievement);
    return { unlocked: true, characterAchievement: saved };
  }

  /**
   * Claim achievement reward
   */
  async claimReward(characterId: number, achievementId: number): Promise<{ success: boolean }> {
    const characterAchievement = await this.characterAchievementRepository.findOne({
      where: { character_id: characterId, achievement_id: achievementId },
      relations: ['achievement'],
    });

    if (!characterAchievement || !characterAchievement.is_unlocked || characterAchievement.reward_claimed) {
      return { success: false };
    }

    const achievement = characterAchievement.achievement;
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character || !achievement) {
      return { success: false };
    }

    // Apply rewards
    if (achievement.rewards.exp) {
      character.exp += achievement.rewards.exp;
      await this.characterRepository.save(character);
    }

    // TODO: Add items to inventory, add currency, etc.

    characterAchievement.reward_claimed = true;
    await this.characterAchievementRepository.save(characterAchievement);

    return { success: true };
  }
}

