import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Monster, MonsterType, MonsterRarity } from '../entities/monster.entity';
import { MonsterSkill } from '../entities/monster-skill.entity';

/**
 * Calculated monster stats (scaled by level)
 */
export interface MonsterCombatStats {
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  physical_attack: number;
  magical_attack: number;
  physical_defense: number;
  magical_defense: number;
  critical_chance: number;
  critical_damage: number;
  speed: number;
  dodge: number;
}

@Injectable()
export class MonstersService {
  constructor(
    @InjectRepository(Monster)
    private monsterRepository: Repository<Monster>,
    @InjectRepository(MonsterSkill)
    private monsterSkillRepository: Repository<MonsterSkill>,
  ) {}

  /**
   * Get all active monsters
   */
  async findAll(): Promise<Monster[]> {
    return this.monsterRepository.find({
      where: { is_active: true },
      order: { level: 'ASC' },
    });
  }

  /**
   * Get monster by ID with skills
   */
  async findOne(id: number, includeSkills: boolean = true): Promise<Monster> {
    const monster = await this.monsterRepository.findOne({
      where: { id },
      relations: includeSkills ? ['monsterSkills', 'monsterSkills.skill'] : [],
    });

    if (!monster) {
      throw new NotFoundException(`Monster with ID ${id} not found`);
    }

    return monster;
  }

  /**
   * Get monster skills
   */
  async getMonsterSkills(monsterId: number): Promise<MonsterSkill[]> {
    return this.monsterSkillRepository.find({
      where: { monster_id: monsterId },
      relations: ['skill'],
      order: { priority: 'DESC' },
    });
  }

  /**
   * Get monsters by level range
   */
  async findByLevelRange(minLevel: number, maxLevel: number): Promise<Monster[]> {
    return this.monsterRepository.find({
      where: {
        is_active: true,
      },
      order: { level: 'ASC' },
    }).then(monsters =>
      monsters.filter(m => m.level >= minLevel && m.level <= maxLevel)
    );
  }

  /**
   * Get monsters by type
   */
  async findByType(type: MonsterType): Promise<Monster[]> {
    return this.monsterRepository.find({
      where: {
        type,
        is_active: true,
      },
      order: { level: 'ASC' },
    });
  }

  /**
   * Get monsters by rarity
   */
  async findByRarity(rarity: MonsterRarity): Promise<Monster[]> {
    return this.monsterRepository.find({
      where: {
        rarity,
        is_active: true,
      },
      order: { level: 'ASC' },
    });
  }

  /**
   * Calculate monster combat stats based on level
   * Stats scale with level using a power curve
   */
  calculateCombatStats(monster: Monster, level?: number): MonsterCombatStats {
    const actualLevel = level || monster.level;
    const levelMultiplier = Math.pow(1.15, actualLevel - 1); // 15% increase per level

    // Rarity multiplier
    const rarityMultiplier = {
      [MonsterRarity.COMMON]: 1.0,
      [MonsterRarity.UNCOMMON]: 1.2,
      [MonsterRarity.RARE]: 1.5,
      [MonsterRarity.EPIC]: 2.0,
      [MonsterRarity.LEGENDARY]: 3.0,
    }[monster.rarity];

    return {
      max_hp: Math.floor(monster.base_hp * levelMultiplier * rarityMultiplier),
      hp: Math.floor(monster.base_hp * levelMultiplier * rarityMultiplier),
      max_mp: Math.floor(monster.base_mp * levelMultiplier * rarityMultiplier),
      mp: Math.floor(monster.base_mp * levelMultiplier * rarityMultiplier),
      physical_attack: Math.floor(monster.base_physical_attack * levelMultiplier * rarityMultiplier),
      magical_attack: Math.floor(monster.base_magical_attack * levelMultiplier * rarityMultiplier),
      physical_defense: Math.floor(monster.base_physical_defense * levelMultiplier * rarityMultiplier),
      magical_defense: Math.floor(monster.base_magical_defense * levelMultiplier * rarityMultiplier),
      critical_chance: Math.min(50, monster.base_critical_chance * (1 + (actualLevel - 1) * 0.1)),
      critical_damage: monster.base_critical_damage + (actualLevel - 1) * 5,
      speed: Math.floor(monster.base_speed * (1 + (actualLevel - 1) * 0.1)),
      dodge: Math.min(30, monster.base_dodge * (1 + (actualLevel - 1) * 0.1)),
    };
  }

  /**
   * Create a new monster (admin only)
   */
  async create(monsterData: Partial<Monster>): Promise<Monster> {
    const monster = this.monsterRepository.create(monsterData);
    return this.monsterRepository.save(monster);
  }

  /**
   * Update monster (admin only)
   */
  async update(id: number, monsterData: Partial<Monster>): Promise<Monster> {
    const monster = await this.findOne(id);
    Object.assign(monster, monsterData);
    return this.monsterRepository.save(monster);
  }

  /**
   * Delete monster (admin only)
   */
  async remove(id: number): Promise<void> {
    const monster = await this.findOne(id);
    await this.monsterRepository.remove(monster);
  }
}

