import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill, DamageFormula } from '../entities/skill.entity';
import { CharacterSkill } from '../entities/character-skill.entity';
import { Character } from '../entities/character.entity';
import { ElementsService } from '../elements/elements.service';
import { ElementType } from '../entities/character-element.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(CharacterSkill)
    private characterSkillRepository: Repository<CharacterSkill>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private elementsService: ElementsService,
  ) {}

  /**
   * Get all skills
   */
  async findAll(): Promise<Skill[]> {
    return this.skillRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get skill by ID
   */
  async findOne(id: number): Promise<Skill> {
    const skill = await this.skillRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  /**
   * Get character's skills
   */
  async getCharacterSkills(characterId: number): Promise<CharacterSkill[]> {
    return this.characterSkillRepository.find({
      where: { character_id: characterId },
      relations: ['skill'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Learn a skill
   */
  async learnSkill(characterId: number, skillId: number): Promise<CharacterSkill> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });
    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    const skill = await this.findOne(skillId);

    // Check if character meets level requirement
    if (character.realm_level < skill.min_level) {
      throw new Error(`Character level too low. Required: ${skill.min_level}`);
    }

    // Check if already learned
    const existing = await this.characterSkillRepository.findOne({
      where: { character_id: characterId, skill_id: skillId },
    });

    if (existing) {
      return existing;
    }

    const characterSkill = this.characterSkillRepository.create({
      character_id: characterId,
      skill_id: skillId,
      level: 1,
      exp: 0,
      is_unlocked: true,
      learned_at: new Date(),
      unlocked_at: new Date(),
    });

    return this.characterSkillRepository.save(characterSkill);
  }

  /**
   * Calculate skill damage
   */
  async calculateSkillDamage(
    characterId: number,
    skillId: number,
  ): Promise<{ damage: number; breakdown: any[] }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });
    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    const skill = await this.findOne(skillId);
    const characterSkill = await this.characterSkillRepository.findOne({
      where: { character_id: characterId, skill_id: skillId },
    });

    if (!characterSkill) {
      throw new NotFoundException('Character has not learned this skill');
    }

    let totalDamage = 0;
    const breakdown: any[] = [];

    for (const formula of skill.damage_formula) {
      let value = 0;

      if (formula.stat) {
        // Get stat value from character
        const statMap: Record<string, number> = {
          luc_dao: character.luc_dao,
          can_cot: character.can_cot,
          than_phap: character.than_phap,
          ngo_tinh: character.ngo_tinh,
          dinh_luc: character.dinh_luc,
        };
        value = statMap[formula.stat] || 0;
      } else if (formula.element) {
        // Get element value
        value = await this.elementsService.getElementValue(characterId, formula.element);
      }

      const damage = value * (formula.multiplier / 100);
      totalDamage += damage;

      breakdown.push({
        source: formula.stat || formula.element,
        value,
        multiplier: formula.multiplier,
        damage,
      });
    }

    // Apply skill level multiplier
    const levelMultiplier = 1 + (characterSkill.level - 1) * 0.1; // 10% per level
    totalDamage *= levelMultiplier;

    return {
      damage: Math.floor(totalDamage),
      breakdown,
    };
  }
}
