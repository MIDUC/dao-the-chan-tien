import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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
   * Get all skills (global skills only, or for a specific character)
   */
  async findAll(characterId?: number): Promise<Skill[]> {
    if (characterId) {
      // Get global skills + personal skills for this character
      return this.skillRepository.find({
        where: [
          { is_active: true, character_id: IsNull() }, // Global skills
          { is_active: true, character_id: characterId }, // Personal skills
        ],
        order: { name: 'ASC' },
      });
    }
    // Get only global skills
    return this.skillRepository.find({
      where: { is_active: true, character_id: IsNull() },
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
   * Get character's skills (only skills that belong to this character)
   * Returns both learned skills and personal skills (not yet learned)
   */
  async getCharacterSkills(characterId: number): Promise<CharacterSkill[]> {
    // Get learned skills
    const learnedSkills = await this.characterSkillRepository.find({
      where: { character_id: characterId },
      relations: ['skill'],
      order: { created_at: 'DESC' },
    });

    // Get personal skills for this character (not yet learned)
    const personalSkills = await this.skillRepository.find({
      where: { 
        is_active: true, 
        character_id: characterId,
      },
    });

    // Filter out personal skills that are already learned
    const unlearnedPersonalSkills = personalSkills.filter(
      ps => !learnedSkills.some(ls => ls.skill_id === ps.id)
    );

    // Convert personal skills to CharacterSkill format (not learned yet)
    const personalSkillsAsCharacterSkills = unlearnedPersonalSkills.map(ps => {
      const cs = new CharacterSkill();
      cs.id = 0; // Temporary ID
      cs.character_id = characterId;
      cs.skill_id = ps.id;
      cs.level = 0;
      cs.exp = 0;
      cs.is_unlocked = false;
      cs.learned_at = null as any; // Can be null for unlearned skills
      cs.unlocked_at = null as any; // Can be null for unlearned skills
      cs.skill = ps;
      cs.created_at = ps.created_at;
      cs.updated_at = ps.updated_at;
      return cs;
    });

    return [...learnedSkills, ...personalSkillsAsCharacterSkills];
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

  /**
   * Create personal starter skills for a character
   * Each character gets unique personal skills
   */
  async createPersonalStarterSkills(characterId: number): Promise<Skill[]> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    // Create 2-3 random personal skills for this character
    const skillTemplates = [
      {
        code: `personal_skill_${characterId}_1`,
        name: 'Công Pháp Cá Nhân I',
        description: 'Kỹ năng công pháp riêng của bạn, sát thương dựa trên lực đạo.',
        damage_formula: [
          { stat: 'luc_dao', multiplier: 120 },
        ] as DamageFormula[],
        cooldown: 3,
        mana_cost: 30,
        min_level: 1,
        character_id: characterId,
      },
      {
        code: `personal_skill_${characterId}_2`,
        name: 'Phòng Thủ Cá Nhân',
        description: 'Kỹ năng phòng thủ riêng, tăng phòng thủ vật lý.',
        damage_formula: [] as DamageFormula[],
        buffs: [
          {
            stat_type: 'physical_defense' as const,
            value_type: 'percentage' as const,
            value: 30,
            duration_rounds: 5,
            stack_type: 'additive' as const,
          },
        ],
        cooldown: 5,
        mana_cost: 40,
        min_level: 1,
        character_id: characterId,
      },
      {
        code: `personal_skill_${characterId}_3`,
        name: 'Tăng Công Cá Nhân',
        description: 'Kỹ năng tăng công riêng, tăng sát thương vật lý.',
        damage_formula: [] as DamageFormula[],
        buffs: [
          {
            stat_type: 'physical_attack' as const,
            value_type: 'percentage' as const,
            value: 50,
            duration_rounds: 10,
            stack_type: 'additive' as const,
          },
        ],
        cooldown: 4,
        mana_cost: 35,
        min_level: 1,
        character_id: characterId,
      },
    ];

    const createdSkills: Skill[] = [];

    // Randomly select 2-3 skills
    const numSkills = 2 + Math.floor(Math.random() * 2); // 2 or 3 skills
    const selectedTemplates = skillTemplates.slice(0, numSkills);

    for (const template of selectedTemplates) {
      // Check if skill already exists
      const existing = await this.skillRepository.findOne({
        where: { code: template.code },
      });

      if (existing) {
        continue;
      }

      const skill = this.skillRepository.create(template);
      const savedSkill = await this.skillRepository.save(skill);
      createdSkills.push(savedSkill);

      // Auto-learn the first personal skill
      if (createdSkills.length === 1) {
        await this.learnSkill(characterId, savedSkill.id);
      }
    }

    return createdSkills;
  }
}
