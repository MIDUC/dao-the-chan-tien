import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';
import { CharacterSkill } from '../entities/character-skill.entity';
import { Character } from '../entities/character.entity';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(CharacterSkill)
    private characterSkillRepository: Repository<CharacterSkill>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  /**
   * Get all skills
   */
  async findAll(): Promise<Skill[]> {
    return this.skillRepository.find({
      where: { is_active: true },
      order: { category: 'ASC', id: 'ASC' },
    });
  }

  /**
   * Get skill by ID
   */
  async findOne(id: number): Promise<Skill | null> {
    return this.skillRepository.findOne({
      where: { id, is_active: true },
    });
  }

  /**
   * Get character skills
   */
  async getCharacterSkills(characterId: number): Promise<CharacterSkill[]> {
    return this.characterSkillRepository.find({
      where: { character_id: characterId },
      relations: ['skill'],
    });
  }

  /**
   * Unlock skill for character
   */
  async unlockSkill(
    characterId: number,
    skillId: number,
  ): Promise<{ success: boolean; message: string; characterSkill?: CharacterSkill }> {
    const skill = await this.findOne(skillId);
    if (!skill) {
      return { success: false, message: 'Skill not found' };
    }

    // Check if already unlocked
    const existing = await this.characterSkillRepository.findOne({
      where: { character_id: characterId, skill_id: skillId },
    });

    if (existing && existing.is_unlocked) {
      return { success: false, message: 'Skill already unlocked', characterSkill: existing };
    }

    // Check requirements
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return { success: false, message: 'Character not found' };
    }

    // Check realm level
    if (skill.requirements.realm_level && character.realm_level < skill.requirements.realm_level) {
      return { success: false, message: 'Realm level requirement not met' };
    }

    // Check prerequisite skills
    if (skill.requirements.prerequisite_skill_ids && skill.requirements.prerequisite_skill_ids.length > 0) {
      const prerequisites = await this.characterSkillRepository.find({
        where: {
          character_id: characterId,
          skill_id: skill.requirements.prerequisite_skill_ids[0],
          is_unlocked: true,
        },
      });

      if (prerequisites.length === 0) {
        return { success: false, message: 'Prerequisite skills not unlocked' };
      }
    }

    // Check item cost
    if (skill.requirements.item_cost && skill.requirements.item_cost.length > 0) {
      for (const cost of skill.requirements.item_cost) {
        const inventory = await this.inventoryRepository.findOne({
          where: { character_id: characterId, item_id: cost.item_id },
        });

        if (!inventory || inventory.quantity < cost.quantity) {
          return { success: false, message: `Not enough items: ${cost.item_id}` };
        }
      }

      // Deduct items
      for (const cost of skill.requirements.item_cost) {
        const inventory = await this.inventoryRepository.findOne({
          where: { character_id: characterId, item_id: cost.item_id },
        });

        if (inventory) {
          inventory.quantity -= cost.quantity;
          if (inventory.quantity === 0) {
            await this.inventoryRepository.remove(inventory);
          } else {
            await this.inventoryRepository.save(inventory);
          }
        }
      }
    }

    // Unlock skill
    let characterSkill = existing;
    if (!characterSkill) {
      characterSkill = this.characterSkillRepository.create({
        character_id: characterId,
        skill_id: skillId,
        is_unlocked: true,
        unlocked_at: new Date(),
        level: 1,
        exp: 0,
      });
    } else {
      characterSkill.is_unlocked = true;
      characterSkill.unlocked_at = new Date();
    }

    const saved = await this.characterSkillRepository.save(characterSkill);
    return { success: true, message: 'Skill unlocked successfully', characterSkill: saved };
  }

  /**
   * Level up skill
   */
  async levelUpSkill(
    characterId: number,
    skillId: number,
  ): Promise<{ success: boolean; message: string; characterSkill?: CharacterSkill }> {
    const characterSkill = await this.characterSkillRepository.findOne({
      where: { character_id: characterId, skill_id: skillId },
      relations: ['skill'],
    });

    if (!characterSkill || !characterSkill.is_unlocked) {
      return { success: false, message: 'Skill not unlocked' };
    }

    const skill = characterSkill.skill;
    if (characterSkill.level >= skill.max_level) {
      return { success: false, message: 'Skill already at max level' };
    }

    // TODO: Check EXP requirement for level up
    // For now, just level up
    characterSkill.level += 1;
    const saved = await this.characterSkillRepository.save(characterSkill);

    return { success: true, message: 'Skill leveled up', characterSkill: saved };
  }
}

