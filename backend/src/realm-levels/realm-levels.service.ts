import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealmLevel, RealmRequirement } from '../entities/realm-level.entity';
import { Character } from '../entities/character.entity';
import { CharacterProgression } from '../entities/character-progression.entity';
import { Currency } from '../entities/currency.entity';
import { Inventory } from '../entities/inventory.entity';
import { getBreakthroughRealm, getBreakthroughInventorySlots } from '../utils/realm.util';

@Injectable()
export class RealmLevelsService {
  constructor(
    @InjectRepository(RealmLevel)
    private realmLevelRepository: Repository<RealmLevel>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(CharacterProgression)
    private progressionRepository: Repository<CharacterProgression>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  /**
   * Get all realm levels
   */
  async getAllRealmLevels(): Promise<RealmLevel[]> {
    return this.realmLevelRepository.find({
      order: { level: 'ASC' },
    });
  }

  /**
   * Get realm level by level number
   */
  async getRealmLevel(level: number): Promise<RealmLevel> {
    const realmLevel = await this.realmLevelRepository.findOne({
      where: { level },
    });
    if (!realmLevel) {
      throw new NotFoundException(`Realm level ${level} not found`);
    }
    return realmLevel;
  }

  /**
   * Get next realm level for a character
   */
  async getNextRealmLevel(characterId: number): Promise<RealmLevel | null> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });
    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const nextLevel = character.realm_level + 1;
    return this.realmLevelRepository.findOne({
      where: { level: nextLevel },
    });
  }

  /**
   * Check if character can break through to next level
   */
  async checkBreakthroughRequirements(
    characterId: number,
  ): Promise<{
    canBreakthrough: boolean;
    nextLevel: RealmLevel | null;
    requirements: RealmRequirement[];
    metRequirements: boolean[];
    character: Character;
  }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });
    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const nextLevel = await this.getNextRealmLevel(characterId);
    if (!nextLevel) {
      return {
        canBreakthrough: false,
        nextLevel: null,
        requirements: [],
        metRequirements: [],
        character,
      };
    }

    // Check if character has enough EXP
    const expRequired = Number(nextLevel.exp_required);
    if (character.exp < expRequired) {
      return {
        canBreakthrough: false,
        nextLevel,
        requirements: nextLevel.requirements || [],
        metRequirements: [],
        character,
      };
    }

    // Check requirements
    const requirements = nextLevel.requirements || [];
    const metRequirements = await Promise.all(
      requirements.map((req) => this.checkRequirement(character, req)),
    );

    const canBreakthrough = metRequirements.every((met) => met === true);

    return {
      canBreakthrough,
      nextLevel,
      requirements,
      metRequirements,
      character,
    };
  }

  /**
   * Check if character meets a specific requirement
   */
  private async checkRequirement(
    character: Character,
    requirement: RealmRequirement,
  ): Promise<boolean> {
    switch (requirement.type) {
      case 'do_kiep':
      case 'luyen_the': {
        // Check from character_progressions table
        const progression = await this.progressionRepository.findOne({
          where: {
            character_id: character.id,
            requirement_type: requirement.type,
          },
        });
        const count = progression ? Number(progression.count) : 0;
        return count >= requirement.count;
      }
      case 'dan_thuoc': {
        // Check if character has required pills/items in inventory
        // For now, check if they have any items (can be improved to check specific items)
        const inventoryCount = await this.inventoryRepository.count({
          where: { character_id: character.id },
        });
        return inventoryCount >= requirement.count;
      }
      case 'linh_thach': {
        // Check character's spirit stones from currency table
        const currency = await this.currencyRepository.findOne({
          where: {
            character_id: character.id,
            currency_type: 'ling_stone' as any,
          },
        });
        const amount = currency ? Number(currency.amount) : 0;
        return amount >= requirement.count;
      }
      case 'tien_ngoc': {
        // Check character's immortal jade (premium currency)
        // For now, check essence as premium currency
        const currency = await this.currencyRepository.findOne({
          where: {
            character_id: character.id,
            currency_type: 'essence' as any,
          },
        });
        const amount = currency ? Number(currency.amount) : 0;
        return amount >= requirement.count;
      }
      case 'cong_duc': {
        // Check character's merit points
        const currency = await this.currencyRepository.findOne({
          where: {
            character_id: character.id,
            currency_type: 'merit_point' as any,
          },
        });
        const amount = currency ? Number(currency.amount) : 0;
        return amount >= requirement.count;
      }
      default:
        return false;
    }
  }

  /**
   * Perform breakthrough to next level
   */
  async breakthrough(characterId: number): Promise<Character> {
    const checkResult = await this.checkBreakthroughRequirements(characterId);
    const { character, nextLevel } = checkResult;

    if (!checkResult.canBreakthrough || !nextLevel) {
      throw new BadRequestException(
        'Cannot breakthrough: requirements not met or no next level',
      );
    }

    // Calculate new EXP (subtract required EXP)
    const expRequired = Number(nextLevel.exp_required);
    const newExp = Math.max(0, character.exp - expRequired);

    // Check if this is a realm breakthrough (new realm name)
    const oldLevel = character.realm_level;
    const newLevel = nextLevel.level;
    const breakthroughRealm = getBreakthroughRealm(oldLevel, newLevel);
    
    // Add inventory slots if breaking through to a new realm
    if (breakthroughRealm) {
      const slotsBonus = getBreakthroughInventorySlots(breakthroughRealm);
      character.max_inventory_slots = (character.max_inventory_slots || 20) + slotsBonus;
    }

    // Update character
    character.realm_level = newLevel;
    character.exp = newExp;

    // TODO: Apply success rate if requirements have success_rate
    // TODO: Handle failure case (might lose resources but not level up)

    return this.characterRepository.save(character);
  }

  /**
   * Calculate success rate for breakthrough based on requirements and character stats
   */
  calculateSuccessRate(
    requirements: RealmRequirement[],
    character: Character,
  ): number {
    let baseRate = 1.0; // 100% base

    for (const req of requirements) {
      if (req.success_rate) {
        // Use minimum rate as base, can be increased by character stats/items
        const minRate = req.success_rate.min;
        const maxRate = req.success_rate.max;

        // Calculate rate based on character stats (strength, agility, wisdom)
        // Higher stats = higher success rate
        const statBonus =
          (character.strength + character.agility + character.wisdom) / 300; // Normalize
        const rate = minRate + (maxRate - minRate) * statBonus;

        baseRate *= rate; // Multiply all rates
      }
    }

    return Math.min(1.0, baseRate); // Cap at 100%
  }
}

