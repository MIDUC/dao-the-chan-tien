import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Talent } from '../entities/talent.entity';
import { CharacterTalent } from '../entities/character-talent.entity';
import { Character } from '../entities/character.entity';

@Injectable()
export class TalentsService {
  constructor(
    @InjectRepository(Talent)
    private talentRepository: Repository<Talent>,
    @InjectRepository(CharacterTalent)
    private characterTalentRepository: Repository<CharacterTalent>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  /**
   * Get all talents
   */
  async findAll(): Promise<Talent[]> {
    return this.talentRepository.find({
      where: { is_active: true },
      order: { grade: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get starter talents (for registration)
   */
  async findStarterTalents(): Promise<Talent[]> {
    return this.talentRepository.find({
      where: { is_starter: true, is_active: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get talent by ID
   */
  async findOne(id: number): Promise<Talent> {
    const talent = await this.talentRepository.findOne({ where: { id } });
    if (!talent) {
      throw new NotFoundException(`Talent with ID ${id} not found`);
    }
    return talent;
  }

  /**
   * Get talent by code
   */
  async findByCode(code: string): Promise<Talent> {
    const talent = await this.talentRepository.findOne({ where: { code } });
    if (!talent) {
      throw new NotFoundException(`Talent with code ${code} not found`);
    }
    return talent;
  }

  /**
   * Get character's talents
   */
  async getCharacterTalents(characterId: number): Promise<CharacterTalent[]> {
    return this.characterTalentRepository.find({
      where: { character_id: characterId },
      relations: ['talent'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Add talent to character
   */
  async addTalentToCharacter(
    characterId: number,
    talentId: number,
    obtainedFrom: string = 'unknown',
  ): Promise<CharacterTalent> {
    // Check if character exists
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });
    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    // Check if talent exists
    const talent = await this.findOne(talentId);

    // Check if character already has this talent
    const existing = await this.characterTalentRepository.findOne({
      where: { character_id: characterId, talent_id: talentId },
    });

    if (existing) {
      return existing; // Already has this talent
    }

    // Create character talent
    const characterTalent = this.characterTalentRepository.create({
      character_id: characterId,
      talent_id: talentId,
      obtained_at: new Date(),
      obtained_from: obtainedFrom,
    });

    return this.characterTalentRepository.save(characterTalent);
  }

  /**
   * Remove talent from character (rare case, but possible)
   */
  async removeTalentFromCharacter(
    characterId: number,
    talentId: number,
  ): Promise<void> {
    const characterTalent = await this.characterTalentRepository.findOne({
      where: { character_id: characterId, talent_id: talentId },
    });

    if (characterTalent) {
      await this.characterTalentRepository.remove(characterTalent);
    }
  }

  /**
   * Check if character has talent
   */
  async characterHasTalent(
    characterId: number,
    talentId: number,
  ): Promise<boolean> {
    const characterTalent = await this.characterTalentRepository.findOne({
      where: { character_id: characterId, talent_id: talentId },
    });
    return !!characterTalent;
  }

  /**
   * Get talent effects for character (for applying bonuses)
   */
  async getCharacterTalentEffects(characterId: number): Promise<any[]> {
    const characterTalents = await this.getCharacterTalents(characterId);
    const effects: any[] = [];

    for (const ct of characterTalents) {
      if (ct.talent && ct.talent.effects) {
        for (const effect of ct.talent.effects) {
          effects.push({
            talentId: ct.talent.id,
            talentName: ct.talent.name,
            ...effect,
          });
        }
      }
    }

    return effects;
  }
}

