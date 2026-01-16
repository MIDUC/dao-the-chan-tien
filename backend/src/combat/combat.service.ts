import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BattleLog, BattleType, BattleResult } from '../entities/battle-log.entity';
import { Character } from '../entities/character.entity';
import { Monster } from '../entities/monster.entity';
import { MonsterSkill } from '../entities/monster-skill.entity';
import { CharacterSkill } from '../entities/character-skill.entity';
import { MonstersService, MonsterCombatStats } from '../monsters/monsters.service';
import { StatsService, CombatStats } from '../stats/stats.service';
import { SkillsService } from '../skills/skills.service';
import { CurrencyService } from '../currency/currency.service';
import { CurrencyType } from '../entities/currency.entity';
import { ItemsService } from '../items/items.service';
import { ElementsService } from '../elements/elements.service';
import { ElementType } from '../entities/character-element.entity';

/**
 * Buff/Debuff effect
 */
export interface BuffEffect {
  stat_type: 
    // Combat stats
    | 'physical_attack' | 'magical_attack' | 'physical_defense' | 'magical_defense' 
    | 'critical_chance' | 'critical_damage' | 'speed' | 'dodge' | 'hp' | 'mp'
    // Primary stats (Tầng Gốc)
    | 'luc_dao' | 'can_cot' | 'than_phap' | 'ngo_tinh' | 'dinh_luc'
    // Elements (Nguyên tố - Linh Căn)
    | 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho' | 'loi' | 'bang' | 'duong' | 'am'
    // Qi Types (Tất cả các loại khí)
    | 'blood_qi' | 'spiritual_qi' | 'vital_qi' // Nhóm Cơ Bản
    | 'righteous_qi' | 'killing_qi' | 'scholarly_qi' | 'demonic_qi' // Nhóm Tính Cách & Phe Phái
    | 'frost_qi' | 'yang_qi' | 'yin_qi' | 'impure_qi' // Nhóm Nguyên Tố & Môi Trường
    | 'prenatal_qi' | 'grandmist_purple_qi' | 'chaos_qi' | 'imperial_qi' // Nhóm Cao Cấp & Truyền Thuyết
    | 'death_qi' // Nhóm Độc Hại
    | 'aura_qi' | 'corpse_qi' // Nhóm Phòng Thủ & Hỗ Trợ
    | 'resentment_qi' | 'charm_qi' // Nhóm Đặc Biệt & Ẩn
    // Debuff stats (giảm chỉ số đối thủ)
    | 'hp_regen' | 'mp_regen'; // Giảm hồi phục HP/MP
  value_type: 'percentage' | 'flat';
  value: number; // For debuffs, use negative values or set target to 'enemy'
  duration_rounds?: number; // undefined = permanent until combat ends
  stack_type?: 'additive' | 'multiplicative';
  skill_name?: string; // Which skill applied this buff
  target?: 'self' | 'enemy'; // 'self' = buff cho bản thân, 'enemy' = debuff cho đối thủ (default: 'self')
}

/**
 * Combat action in a round
 */
export interface CombatAction {
  round: number;
  attacker: 'player' | 'opponent';
  action_type: 'attack' | 'skill' | 'defend' | 'buff';
  damage?: number;
  is_critical?: boolean;
  is_dodged?: boolean;
  skill_name?: string;
  buffs_applied?: BuffEffect[];
  message: string;
}

/**
 * Complete combat result
 */
export interface CombatResult {
  winner: 'player' | 'opponent' | 'draw';
  result: BattleResult;
  rounds: CombatAction[];
  total_rounds: number;
  player_final_hp: number;
  opponent_final_hp: number;
  exp_gained: number;
  gold_gained: number;
  items_dropped: Array<{ item_id: number; quantity: number }>;
  battle_log_id: number;
}

@Injectable()
export class CombatService {
  constructor(
    @InjectRepository(BattleLog)
    private battleLogRepository: Repository<BattleLog>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Monster)
    private monsterRepository: Repository<Monster>,
    @InjectRepository(MonsterSkill)
    private monsterSkillRepository: Repository<MonsterSkill>,
    @InjectRepository(CharacterSkill)
    private characterSkillRepository: Repository<CharacterSkill>,
    private monstersService: MonstersService,
    private statsService: StatsService,
    private skillsService: SkillsService,
    private currencyService: CurrencyService,
    private itemsService: ItemsService,
    private elementsService: ElementsService,
  ) {}

  /**
   * Start PvE combat (Player vs Monster)
   */
  async startPvECombat(characterId: number, monsterId: number): Promise<CombatResult> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const monster = await this.monstersService.findOne(monsterId, true);
    const monsterSkills = await this.monstersService.getMonsterSkills(monsterId);
    const playerSkills = await this.skillsService.getCharacterSkills(characterId);
    const playerStats = await this.statsService.calculateCombatStats(characterId);
    const monsterStats = this.monstersService.calculateCombatStats(monster);

    // Set current HP and MP to max for both
    playerStats.hp = playerStats.max_hp;
    playerStats.mp = playerStats.max_mp;
    monsterStats.hp = monsterStats.max_hp;
    monsterStats.mp = monsterStats.max_mp;

    // Execute combat with skills
    const combatResult = await this.executeCombat(
      playerStats,
      monsterStats,
      character.realm_level,
      monsterSkills,
      playerSkills,
    );

    // Calculate rewards
    let expGained = 0;
    let goldGained = 0;
    const itemsDropped: Array<{ item_id: number; quantity: number }> = [];

    if (combatResult.winner === 'player') {
      expGained = monster.exp_reward;
      goldGained = monster.gold_reward;

      // Process item drops
      if (monster.item_drops) {
        for (const drop of monster.item_drops) {
          const roll = Math.random() * 100;
          if (roll <= drop.drop_rate) {
            itemsDropped.push({ item_id: drop.item_id, quantity: 1 });
          }
        }
      }

      // Update character EXP
      character.exp += expGained;
      await this.characterRepository.save(character);

      // Add gold (using ling_stone as currency)
      if (goldGained > 0) {
        await this.currencyService.addCurrency(characterId, CurrencyType.LING_STONE, goldGained);
      }

      // Add items to inventory (simplified - would need proper inventory service)
      // TODO: Implement proper item addition to inventory
    }

    // Save battle log
    const battleLog = this.battleLogRepository.create({
      character_id: characterId,
      opponent_id: monsterId,
      battle_type: BattleType.PVE,
      result: combatResult.result,
      battle_data: {
        rounds: combatResult.total_rounds,
        damage_dealt: combatResult.rounds
          .filter(r => r.attacker === 'player' && r.damage)
          .reduce((sum, r) => sum + (r.damage || 0), 0),
        damage_taken: combatResult.rounds
          .filter(r => r.attacker === 'opponent' && r.damage)
          .reduce((sum, r) => sum + (r.damage || 0), 0),
        duration_seconds: combatResult.total_rounds * 2, // Estimate
      },
      exp_gained: expGained,
      items_dropped: itemsDropped,
    });

    const savedLog = await this.battleLogRepository.save(battleLog);

    return {
      ...combatResult,
      exp_gained: expGained,
      gold_gained: goldGained,
      items_dropped: itemsDropped,
      battle_log_id: savedLog.id,
    };
  }

  /**
   * Start PvP combat (Player vs Player)
   */
  async startPvPCombat(characterId1: number, characterId2: number): Promise<CombatResult> {
    if (characterId1 === characterId2) {
      throw new BadRequestException('Cannot fight yourself');
    }

    const character1 = await this.characterRepository.findOne({
      where: { id: characterId1 },
    });
    const character2 = await this.characterRepository.findOne({
      where: { id: characterId2 },
    });

    if (!character1 || !character2) {
      throw new NotFoundException('Character not found');
    }

    const player1Stats = await this.statsService.calculateCombatStats(characterId1);
    const player2Stats = await this.statsService.calculateCombatStats(characterId2);

    // Set current HP to max HP for both
    player1Stats.hp = player1Stats.max_hp;
    player2Stats.hp = player2Stats.max_hp;

    // Execute combat (player1 is "player", player2 is "opponent")
    const combatResult = await this.executeCombat(player1Stats, player2Stats, character1.realm_level);

    // PvP rewards (smaller than PvE)
    let expGained = 0;
    if (combatResult.winner === 'player') {
      // Winner gets small EXP bonus
      expGained = Math.floor(50 * (1 + character2.realm_level * 0.1));
      character1.exp += expGained;
      await this.characterRepository.save(character1);
    } else if (combatResult.winner === 'opponent') {
      expGained = Math.floor(50 * (1 + character1.realm_level * 0.1));
      character2.exp += expGained;
      await this.characterRepository.save(character2);
    }

    // Save battle log for player 1
    const battleLog = this.battleLogRepository.create({
      character_id: characterId1,
      opponent_id: characterId2,
      battle_type: BattleType.PVP,
      result: combatResult.result,
      battle_data: {
        rounds: combatResult.total_rounds,
        damage_dealt: combatResult.rounds
          .filter(r => r.attacker === 'player' && r.damage)
          .reduce((sum, r) => sum + (r.damage || 0), 0),
        damage_taken: combatResult.rounds
          .filter(r => r.attacker === 'opponent' && r.damage)
          .reduce((sum, r) => sum + (r.damage || 0), 0),
        duration_seconds: combatResult.total_rounds * 2,
      },
      exp_gained: combatResult.winner === 'player' ? expGained : 0,
      items_dropped: [],
    });

    const savedLog = await this.battleLogRepository.save(battleLog);

    return {
      ...combatResult,
      exp_gained: combatResult.winner === 'player' ? expGained : 0,
      gold_gained: 0,
      items_dropped: [],
      battle_log_id: savedLog.id,
    };
  }

  /**
   * Execute combat between two entities
   * Each round = 100ms, player can use skills freely if cooldown and mana allow
   */
  private async executeCombat(
    playerStats: CombatStats,
    opponentStats: MonsterCombatStats | CombatStats,
    playerRealmLevel: number,
    monsterSkills: MonsterSkill[] = [],
    playerSkills: CharacterSkill[] = [],
  ): Promise<Omit<CombatResult, 'exp_gained' | 'gold_gained' | 'items_dropped' | 'battle_log_id'>> {
    const actions: CombatAction[] = [];
    let currentPlayerHp = playerStats.hp;
    let currentPlayerMp = playerStats.mp;
    let currentOpponentHp = opponentStats.hp;
    let currentOpponentMp = opponentStats.mp;
    let round = 0;
    const maxRounds = 50; // Prevent infinite loops
    const roundDurationMs = 100; // Each round = 100ms

    // Track skill cooldowns: { skillId: cooldown_ms_remaining }
    const playerSkillCooldowns: Map<number, number> = new Map();
    const monsterSkillCooldowns: Map<number, number> = new Map();

    // Track buffs: { stat_type: BuffEffect[] }
    const playerBuffs: Map<string, BuffEffect[]> = new Map();
    const opponentBuffs: Map<string, BuffEffect[]> = new Map();
    
    // Track element buffs separately (for skill damage calculation)
    const playerElementBuffs: Map<string, BuffEffect[]> = new Map();
    const opponentElementBuffs: Map<string, BuffEffect[]> = new Map();
    
    // Track primary stat buffs separately (affect combat stats through formulas)
    const playerPrimaryStatBuffs: Map<string, BuffEffect[]> = new Map();
    const opponentPrimaryStatBuffs: Map<string, BuffEffect[]> = new Map();

    // Determine turn order based on speed
    let playerTurn = playerStats.speed >= opponentStats.speed;

    while (currentPlayerHp > 0 && currentOpponentHp > 0 && round < maxRounds) {
      round++;

      // Decrease cooldowns (in milliseconds)
      for (const [skillId, cooldown] of playerSkillCooldowns.entries()) {
        if (cooldown > 0) {
          const newCooldown = Math.max(0, cooldown - roundDurationMs);
          playerSkillCooldowns.set(skillId, newCooldown);
        }
      }
      for (const [skillId, cooldown] of monsterSkillCooldowns.entries()) {
        if (cooldown > 0) {
          const newCooldown = Math.max(0, cooldown - roundDurationMs);
          monsterSkillCooldowns.set(skillId, newCooldown);
        }
      }

      // Decrease buff durations and remove expired buffs
      this.updateBuffsDuration(playerBuffs);
      this.updateBuffsDuration(opponentBuffs);
      this.updateBuffsDuration(playerElementBuffs);
      this.updateBuffsDuration(opponentElementBuffs);
      this.updateBuffsDuration(playerPrimaryStatBuffs);
      this.updateBuffsDuration(opponentPrimaryStatBuffs);

      if (playerTurn) {
        // Player can use skills freely (if cooldown and mana allow)
        // Try to use a skill first, if not available, use normal attack
        if (playerSkills.length > 0) {
          const skillResult = await this.tryUsePlayerSkill(
            playerSkills,
            playerStats,
            opponentStats,
            playerSkillCooldowns,
            currentPlayerMp,
            playerRealmLevel,
            playerElementBuffs,
          );

          if (skillResult.used) {
            // Apply buffs/debuffs if any
            if (skillResult.buffs_applied && skillResult.buffs_applied.length > 0) {
              // Separate buffs (self) and debuffs (enemy)
              const selfBuffs = skillResult.buffs_applied.filter(b => !b.target || b.target === 'self');
              const enemyDebuffs = skillResult.buffs_applied.filter(b => b.target === 'enemy');
              
              // Apply buffs to self
              if (selfBuffs.length > 0) {
                this.applyBuffs(selfBuffs, playerBuffs, playerElementBuffs, playerPrimaryStatBuffs);
              }
              
              // Apply debuffs to enemy
              if (enemyDebuffs.length > 0) {
                this.applyBuffs(enemyDebuffs, opponentBuffs, opponentElementBuffs, opponentPrimaryStatBuffs);
              }
            }

            // Calculate damage with buffed stats (buffs affect future attacks, not current)
            // But if this is a damage skill, we need to recalculate with current buffs
            let actualDamage = skillResult.damage || 0;
            
            // If skill has damage and we have buffs, recalculate damage with buffed stats
            if (actualDamage > 0 && (playerBuffs.size > 0 || playerPrimaryStatBuffs.size > 0)) {
              const buffedPlayerStats = this.applyBuffsToStats(
                playerStats, 
                playerBuffs, 
                playerPrimaryStatBuffs
              );
              // Recalculate damage based on buffed attack stats
              // Damage scales with attack stats
              const baseAttack = buffedPlayerStats.physical_attack;
              const originalAttack = playerStats.physical_attack;
              if (originalAttack > 0) {
                actualDamage = Math.floor(actualDamage * (baseAttack / originalAttack));
              }
            }
            
            currentOpponentHp = Math.max(0, currentOpponentHp - actualDamage);
            currentPlayerMp = Math.max(0, currentPlayerMp - (skillResult.mana_cost || 0));
            if (skillResult.skill_id && skillResult.cooldown_ms !== undefined) {
              playerSkillCooldowns.set(skillResult.skill_id, skillResult.cooldown_ms);
            }
            actions.push({
              round,
              attacker: 'player',
              action_type: skillResult.buffs_applied && skillResult.buffs_applied.length > 0 ? 'buff' : 'skill',
              damage: actualDamage,
              is_critical: skillResult.is_critical || false,
              is_dodged: skillResult.is_dodged || false,
              skill_name: skillResult.skill_name,
              buffs_applied: skillResult.buffs_applied,
              message: skillResult.message || `Bạn dùng ${skillResult.skill_name || 'kỹ năng'}`,
            });
          } else {
            // Normal attack (no skill available) - use buffed stats for player, debuffed stats for opponent
            const buffedPlayerStats = this.applyBuffsToStats(
              playerStats, 
              playerBuffs, 
              playerPrimaryStatBuffs
            );
            const debuffedOpponentStats = this.applyBuffsToStats(
              opponentStats,
              opponentBuffs,
              opponentPrimaryStatBuffs
            );
            const attackResult = this.calculateAttack(buffedPlayerStats, debuffedOpponentStats, 'player');
            currentOpponentHp = Math.max(0, currentOpponentHp - attackResult.damage);
            actions.push({
              round,
              attacker: 'player',
              action_type: 'attack',
              ...attackResult,
            });
          }
        } else {
          // No skills, normal attack
          const attackResult = this.calculateAttack(playerStats, opponentStats, 'player');
          currentOpponentHp = Math.max(0, currentOpponentHp - attackResult.damage);
          actions.push({
            round,
            attacker: 'player',
            action_type: 'attack',
            ...attackResult,
          });
        }
      } else {
        // Opponent (monster) can use skills or normal attack
        if (monsterSkills.length > 0) {
          const skillResult = this.tryUseMonsterSkill(
            monsterSkills,
            opponentStats,
            playerStats,
            monsterSkillCooldowns,
            currentOpponentMp,
          );

          if (skillResult.used) {
            // Apply buffs/debuffs if any
            if (skillResult.buffs_applied && skillResult.buffs_applied.length > 0) {
              // Separate buffs (self) and debuffs (enemy)
              const selfBuffs = skillResult.buffs_applied.filter(b => !b.target || b.target === 'self');
              const enemyDebuffs = skillResult.buffs_applied.filter(b => b.target === 'enemy');
              
              // Apply buffs to self (monster)
              if (selfBuffs.length > 0) {
                this.applyBuffs(selfBuffs, opponentBuffs, opponentElementBuffs, opponentPrimaryStatBuffs);
              }
              
              // Apply debuffs to enemy (player)
              if (enemyDebuffs.length > 0) {
                this.applyBuffs(enemyDebuffs, playerBuffs, playerElementBuffs, playerPrimaryStatBuffs);
              }
            }
            
            // Used a skill
            currentPlayerHp = Math.max(0, currentPlayerHp - (skillResult.damage || 0));
            currentOpponentMp = Math.max(0, currentOpponentMp - (skillResult.mana_cost || 0));
            if (skillResult.skill_id && skillResult.cooldown !== undefined) {
              monsterSkillCooldowns.set(skillResult.skill_id, skillResult.cooldown * 1000); // Convert seconds to ms
            }
            actions.push({
              round,
              attacker: 'opponent',
              action_type: skillResult.buffs_applied && skillResult.buffs_applied.length > 0 ? 'buff' : 'skill',
              damage: skillResult.damage || 0,
              is_critical: skillResult.is_critical || false,
              is_dodged: skillResult.is_dodged || false,
              skill_name: skillResult.skill_name,
              buffs_applied: skillResult.buffs_applied,
              message: skillResult.message || `Đối thủ dùng ${skillResult.skill_name || 'kỹ năng'}`,
            });
          } else {
            // Normal attack - use debuffed player stats
            const debuffedPlayerStats = this.applyBuffsToStats(
              playerStats,
              playerBuffs,
              playerPrimaryStatBuffs
            );
            const attackResult = this.calculateAttack(opponentStats, debuffedPlayerStats, 'opponent');
            currentPlayerHp = Math.max(0, currentPlayerHp - attackResult.damage);
            actions.push({
              round,
              attacker: 'opponent',
              action_type: 'attack',
              ...attackResult,
            });
          }
        } else {
          // No skills, normal attack
          const attackResult = this.calculateAttack(opponentStats, playerStats, 'opponent');
          currentPlayerHp = Math.max(0, currentPlayerHp - attackResult.damage);
          actions.push({
            round,
            attacker: 'opponent',
            action_type: 'attack',
            ...attackResult,
          });
        }
      }

      // Alternate turns
      playerTurn = !playerTurn;
    }

    // Determine winner
    let winner: 'player' | 'opponent' | 'draw' = 'draw';
    let result: BattleResult = BattleResult.DRAW;

    if (currentPlayerHp > 0 && currentOpponentHp <= 0) {
      winner = 'player';
      result = BattleResult.WIN;
    } else if (currentOpponentHp > 0 && currentPlayerHp <= 0) {
      winner = 'opponent';
      result = BattleResult.LOSE;
    } else {
      winner = 'draw';
      result = BattleResult.DRAW;
    }

    return {
      winner,
      result,
      rounds: actions,
      total_rounds: round,
      player_final_hp: currentPlayerHp,
      opponent_final_hp: currentOpponentHp,
    };
  }

  /**
   * Try to use a player skill
   * Returns skill result if used, or null if no skill available
   */
  private async tryUsePlayerSkill(
    playerSkills: CharacterSkill[],
    attackerStats: CombatStats,
    defenderStats: MonsterCombatStats | CombatStats,
    skillCooldowns: Map<number, number>,
    currentMp: number,
    playerRealmLevel: number,
    playerElementBuffs?: Map<string, BuffEffect[]>,
  ): Promise<{
    used: boolean;
    skill_id?: number;
    skill_name?: string;
    damage?: number;
    mana_cost?: number;
    cooldown_ms?: number;
    is_critical?: boolean;
    is_dodged?: boolean;
    buffs_applied?: BuffEffect[];
    message?: string;
  }> {
    // Filter available skills (cooldown ready, enough MP)
    const availableSkills = playerSkills.filter((cs) => {
      const skill = cs.skill;
      const cooldown = skillCooldowns.get(cs.skill_id) || 0;
      return cooldown === 0 && currentMp >= skill.mana_cost;
    });

    if (availableSkills.length === 0) {
      return { used: false };
    }

    // For now, use the first available skill (can be improved with priority system)
    // In real-time combat, player would choose which skill to use
    const selectedSkill = availableSkills[0];
    const skill = selectedSkill.skill;

    // Check if skill has buffs
    const buffsApplied: BuffEffect[] = [];
    if (skill.buffs && skill.buffs.length > 0) {
      for (const buff of skill.buffs) {
        buffsApplied.push({
          ...buff,
          skill_name: skill.name,
        });
      }
    }

    // Check dodge (only for damage skills, buff skills don't need dodge check)
    const isDamageSkill = skill.damage_formula && skill.damage_formula.length > 0;
    let damage = 0;
    let isCritical = false;
    let isDodged = false;

    if (isDamageSkill) {
      const dodgeRoll = Math.random() * 100;
      if (dodgeRoll < defenderStats.dodge) {
        return {
          used: true,
          skill_id: selectedSkill.skill_id,
          skill_name: skill.name,
          damage: 0,
          mana_cost: skill.mana_cost,
          cooldown_ms: skill.cooldown * 1000,
          is_critical: false,
          is_dodged: true,
          buffs_applied: buffsApplied.length > 0 ? buffsApplied : undefined,
          message: `Bạn dùng ${skill.name} nhưng bị né tránh!${buffsApplied.length > 0 ? ' (Buffs vẫn được áp dụng)' : ''}`,
        };
      }

      // Calculate skill damage using skill formula
      const characterId = selectedSkill.character_id;
      
      // Calculate damage with element buffs if available
      if (playerElementBuffs && playerElementBuffs.size > 0 && skill.damage_formula) {
        // Calculate damage manually with element buffs
        let totalDamage = 0;
        for (const formula of skill.damage_formula) {
          let value = 0;
          
          if (formula.stat) {
            // Get stat value from character (would need character object, but we'll use base damage calculation)
            // For now, use base calculation and apply element buffs
            const statMap: Record<string, number> = {
              luc_dao: attackerStats.physical_attack / 2, // Approximate
              can_cot: attackerStats.physical_defense / 1.5, // Approximate
              than_phap: attackerStats.speed / 2, // Approximate
              ngo_tinh: attackerStats.magical_attack / 2, // Approximate
              dinh_luc: 0, // Not directly mapped
            };
            value = statMap[formula.stat] || 0;
          } else if (formula.element) {
            // Get element value with buffs
            const baseElementValue = await this.elementsService.getElementValue(characterId, formula.element);
            const elementBuffsForType = playerElementBuffs.get(formula.element) || [];
            
            // Apply element buffs
            let buffedValue = baseElementValue;
            for (const buff of elementBuffsForType) {
              if (buff.value_type === 'percentage') {
                buffedValue = buffedValue * (1 + buff.value / 100);
              } else {
                buffedValue += buff.value;
              }
            }
            value = buffedValue;
          }
          
          totalDamage += value * (formula.multiplier / 100);
        }
        
        // Apply skill level multiplier
        const levelMultiplier = 1 + (selectedSkill.level - 1) * 0.1;
        damage = Math.floor(totalDamage * levelMultiplier);
      } else {
        // Use standard calculation
        const damageResult = await this.skillsService.calculateSkillDamage(
          characterId,
          selectedSkill.skill_id,
        );
        damage = damageResult.damage;
      }

      // Apply defense
      damage = Math.max(1, damage - defenderStats.physical_defense * 0.5);

      // Check critical
      const critRoll = Math.random() * 100;
      isCritical = critRoll < attackerStats.critical_chance;
      if (isCritical) {
        damage *= attackerStats.critical_damage / 100;
      }

      // Add random variance (80-120%)
      damage *= 0.8 + Math.random() * 0.4;
      damage = Math.floor(damage);
    }

    // Build message
    let message = '';
    if (isDamageSkill) {
      message = `Bạn dùng ${skill.name} gây ${damage} sát thương${isCritical ? ' (Bạo kích!)' : ''}`;
    } else {
      message = `Bạn dùng ${skill.name}`;
    }
    if (buffsApplied.length > 0) {
      const buffNames = buffsApplied.map(b => `${b.stat_type} ${b.value > 0 ? '+' : ''}${b.value}${b.value_type === 'percentage' ? '%' : ''}`).join(', ');
      message += ` - Áp dụng buff: ${buffNames}`;
    }

    return {
      used: true,
      skill_id: selectedSkill.skill_id,
      skill_name: skill.name,
      damage: isDamageSkill ? damage : undefined,
      mana_cost: skill.mana_cost,
      cooldown_ms: skill.cooldown * 1000,
      is_critical: isCritical,
      is_dodged: isDodged,
      buffs_applied: buffsApplied.length > 0 ? buffsApplied : undefined,
      message,
    };
  }

  /**
   * Try to use a monster skill
   * Returns skill result if used, or null if no skill available
   */
  private tryUseMonsterSkill(
    monsterSkills: MonsterSkill[],
    attackerStats: MonsterCombatStats,
    defenderStats: CombatStats,
    skillCooldowns: Map<number, number>,
    currentMp: number,
  ): {
    used: boolean;
    skill_id?: number;
    skill_name?: string;
    damage?: number;
    mana_cost?: number;
    cooldown?: number;
    is_critical?: boolean;
    is_dodged?: boolean;
    buffs_applied?: BuffEffect[];
    message?: string;
  } {
    // Filter available skills (cooldown ready, enough MP)
    // Cooldown is in milliseconds
    const availableSkills = monsterSkills.filter((ms) => {
      const skill = ms.skill;
      const cooldown = skillCooldowns.get(ms.skill_id) || 0;
      return cooldown === 0 && currentMp >= skill.mana_cost;
    });

    if (availableSkills.length === 0) {
      return { used: false };
    }

    // Select skill based on priority (weighted random)
    const totalPriority = availableSkills.reduce((sum, ms) => sum + ms.priority, 0);
    let random = Math.random() * totalPriority;
    let selectedSkill: MonsterSkill | null = null;

    for (const ms of availableSkills) {
      random -= ms.priority;
      if (random <= 0) {
        selectedSkill = ms;
        break;
      }
    }

    if (!selectedSkill) {
      selectedSkill = availableSkills[0]; // Fallback
    }

    const skill = selectedSkill.skill;

    // Check if skill has buffs/debuffs
    const buffsApplied: BuffEffect[] = [];
    if (skill.buffs && skill.buffs.length > 0) {
      for (const buff of skill.buffs) {
        buffsApplied.push({
          ...buff,
          skill_name: skill.name,
        });
      }
    }

    // Check dodge
    const dodgeRoll = Math.random() * 100;
    if (dodgeRoll < defenderStats.dodge) {
      return {
        used: true,
        skill_id: selectedSkill.skill_id,
        skill_name: skill.name,
        damage: 0,
        mana_cost: skill.mana_cost,
        cooldown: skill.cooldown * 1000, // Convert to milliseconds
        is_critical: false,
        is_dodged: true,
        buffs_applied: buffsApplied.length > 0 ? buffsApplied : undefined,
        message: `Quái vật dùng ${skill.name} nhưng bị né tránh!${buffsApplied.length > 0 ? ' (Buffs vẫn được áp dụng)' : ''}`,
      };
    }

    // Calculate skill damage
    // Base damage from skill formula (simplified - using physical attack as base)
    let baseDamage = attackerStats.physical_attack * 1.5; // Skills do more damage

    // Apply skill level multiplier
    const levelMultiplier = 1 + (selectedSkill.skill_level - 1) * 0.15; // 15% per level
    baseDamage *= levelMultiplier;

    // Apply defense
    let damage = Math.max(1, baseDamage - defenderStats.physical_defense * 0.5);

    // Check critical
    const critRoll = Math.random() * 100;
    const isCritical = critRoll < attackerStats.critical_chance;
    if (isCritical) {
      damage *= attackerStats.critical_damage / 100;
    }

    // Add random variance (80-120%)
    damage *= 0.8 + Math.random() * 0.4;
    damage = Math.floor(damage);

    return {
      used: true,
      skill_id: selectedSkill.skill_id,
      skill_name: skill.name,
      damage,
      mana_cost: skill.mana_cost,
      cooldown: skill.cooldown * 1000, // Convert to milliseconds
      is_critical: isCritical,
      is_dodged: false,
      buffs_applied: buffsApplied.length > 0 ? buffsApplied : undefined,
      message: `Quái vật dùng ${skill.name} gây ${damage} sát thương${isCritical ? ' (Bạo kích!)' : ''}${buffsApplied.length > 0 ? ' (Áp dụng buffs/debuffs)' : ''}`,
    };
  }

  /**
   * Calculate attack damage
   */
  private calculateAttack(
    attackerStats: CombatStats | MonsterCombatStats,
    defenderStats: CombatStats | MonsterCombatStats,
    attackerType: 'player' | 'opponent',
  ): {
    damage: number;
    is_critical: boolean;
    is_dodged: boolean;
    message: string;
  } {
    // Check dodge
    const dodgeRoll = Math.random() * 100;
    if (dodgeRoll < defenderStats.dodge) {
      return {
        damage: 0,
        is_critical: false,
        is_dodged: true,
        message: `${attackerType === 'player' ? 'Bạn' : 'Đối thủ'} tấn công nhưng bị né tránh!`,
      };
    }

    // Determine attack type (physical or magical)
    const usePhysical = Math.random() > 0.5; // 50% chance for each
    const baseAttack = usePhysical
      ? attackerStats.physical_attack
      : attackerStats.magical_attack;
    const baseDefense = usePhysical
      ? defenderStats.physical_defense
      : defenderStats.magical_defense;

    // Calculate base damage
    let damage = Math.max(1, baseAttack - baseDefense * 0.5);

    // Check critical hit
    const critRoll = Math.random() * 100;
    const isCritical = critRoll < attackerStats.critical_chance;
    if (isCritical) {
      damage *= attackerStats.critical_damage / 100;
    }

    // Add random variance (80-120%)
    damage *= 0.8 + Math.random() * 0.4;
    damage = Math.floor(damage);

    const attackType = usePhysical ? 'vật lý' : 'pháp thuật';
    const critText = isCritical ? ' (Bạo kích!)' : '';
    const message = `${attackerType === 'player' ? 'Bạn' : 'Đối thủ'} tấn công ${attackType} gây ${damage} sát thương${critText}`;

    return {
      damage,
      is_critical: isCritical,
      is_dodged: false,
      message,
    };
  }

  /**
   * Get battle history for a character
   */
  async getBattleHistory(characterId: number, limit: number = 20): Promise<BattleLog[]> {
    return this.battleLogRepository.find({
      where: { character_id: characterId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Apply buffs to appropriate buffs maps
   * Separates combat stats, elements, and primary stats
   */
  private applyBuffs(
    buffs: BuffEffect[], 
    combatBuffsMap: Map<string, BuffEffect[]>,
    elementBuffsMap: Map<string, BuffEffect[]>,
    primaryStatBuffsMap: Map<string, BuffEffect[]>
  ): void {
    const elementTypes = ['kim', 'moc', 'thuy', 'hoa', 'tho', 'loi', 'bang', 'duong', 'am'];
    const primaryStatTypes = ['luc_dao', 'can_cot', 'than_phap', 'ngo_tinh', 'dinh_luc'];
    const qiTypes = [
      // Nhóm Cơ Bản
      'blood_qi', 'spiritual_qi', 'vital_qi',
      // Nhóm Tính Cách & Phe Phái
      'righteous_qi', 'killing_qi', 'scholarly_qi', 'demonic_qi',
      // Nhóm Nguyên Tố & Môi Trường
      'frost_qi', 'yang_qi', 'yin_qi', 'impure_qi',
      // Nhóm Cao Cấp & Truyền Thuyết
      'prenatal_qi', 'grandmist_purple_qi', 'chaos_qi', 'imperial_qi',
      // Nhóm Độc Hại
      'death_qi',
      // Nhóm Phòng Thủ & Hỗ Trợ
      'aura_qi', 'corpse_qi',
      // Nhóm Đặc Biệt & Ẩn
      'resentment_qi', 'charm_qi',
    ];
    
    for (const buff of buffs) {
      if (elementTypes.includes(buff.stat_type)) {
        // Element buff
        const existingBuffs = elementBuffsMap.get(buff.stat_type) || [];
        existingBuffs.push(buff);
        elementBuffsMap.set(buff.stat_type, existingBuffs);
      } else if (primaryStatTypes.includes(buff.stat_type)) {
        // Primary stat buff
        const existingBuffs = primaryStatBuffsMap.get(buff.stat_type) || [];
        existingBuffs.push(buff);
        primaryStatBuffsMap.set(buff.stat_type, existingBuffs);
      } else if (qiTypes.includes(buff.stat_type)) {
        // Qi type buff - store in combat buffs map (can be used for various effects)
        const existingBuffs = combatBuffsMap.get(buff.stat_type) || [];
        existingBuffs.push(buff);
        combatBuffsMap.set(buff.stat_type, existingBuffs);
      } else {
        // Combat stat or other stat
        const existingBuffs = combatBuffsMap.get(buff.stat_type) || [];
        existingBuffs.push(buff);
        combatBuffsMap.set(buff.stat_type, existingBuffs);
      }
    }
  }

  /**
   * Apply buffs to stats and return modified stats
   * Buffs stack: additive (default for percentage) or multiplicative
   * Example: 100 attack + 50% + 50% = 200 attack (additive) or 225 attack (multiplicative)
   * 
   * Primary stat buffs affect combat stats through formulas:
   * - luc_dao -> physical_attack (luc_dao * 2)
   * - can_cot -> hp (can_cot * 10), physical_defense (can_cot * 1.5)
   * - than_phap -> speed (than_phap * 2), dodge (than_phap * 0.3%), critical_chance (than_phap * 0.5%)
   * - ngo_tinh -> mp (ngo_tinh * 10), magical_attack (ngo_tinh * 2), magical_defense (ngo_tinh * 1.5)
   */
  private applyBuffsToStats(
    baseStats: CombatStats | MonsterCombatStats,
    combatBuffsMap: Map<string, BuffEffect[]>,
    primaryStatBuffsMap?: Map<string, BuffEffect[]>,
  ): CombatStats | MonsterCombatStats {
    const buffedStats = { ...baseStats };
    
    // First, apply primary stat buffs to combat stats through formulas
    if (primaryStatBuffsMap && primaryStatBuffsMap.size > 0) {
      // Calculate buffed primary stats (we need base values, but we'll approximate from combat stats)
      // This is a simplified approach - in a full implementation, we'd store base primary stats
      const primaryStatMultipliers: Record<string, { stat: keyof CombatStats; multiplier: number }[]> = {
        luc_dao: [{ stat: 'physical_attack', multiplier: 0.5 }], // luc_dao * 2 = physical_attack, so buff affects 50% of physical_attack
        can_cot: [
          { stat: 'max_hp', multiplier: 0.1 }, // can_cot * 10 = max_hp
          { stat: 'physical_defense', multiplier: 0.67 } // can_cot * 1.5 = physical_defense
        ],
        than_phap: [
          { stat: 'speed', multiplier: 0.5 }, // than_phap * 2 = speed
          { stat: 'dodge', multiplier: 0.33 }, // than_phap * 0.3% = dodge (approximate)
          { stat: 'critical_chance', multiplier: 0.5 } // than_phap * 0.5% = critical_chance
        ],
        ngo_tinh: [
          { stat: 'max_mp', multiplier: 0.1 }, // ngo_tinh * 10 = max_mp
          { stat: 'magical_attack', multiplier: 0.5 }, // ngo_tinh * 2 = magical_attack
          { stat: 'magical_defense', multiplier: 0.67 } // ngo_tinh * 1.5 = magical_defense
        ],
      };
      
      for (const [primaryStatType, buffs] of primaryStatBuffsMap.entries()) {
        if (buffs.length === 0) continue;
        
        const multipliers = primaryStatMultipliers[primaryStatType];
        if (!multipliers) continue;
        
        // Calculate total buff value
        let totalBuffPercentage = 0;
        let totalBuffFlat = 0;
        
        for (const buff of buffs) {
          if (buff.value_type === 'percentage') {
            totalBuffPercentage += buff.value;
          } else {
            totalBuffFlat += buff.value;
          }
        }
        
        // Apply to affected combat stats
        for (const { stat, multiplier } of multipliers) {
          if (stat in buffedStats) {
            const baseValue = (baseStats as any)[stat] || 0;
            // Apply percentage buff (scaled by multiplier)
            if (totalBuffPercentage !== 0) {
              (buffedStats as any)[stat] = baseValue * (1 + (totalBuffPercentage * multiplier) / 100);
            }
            // Apply flat buff (scaled by multiplier)
            if (totalBuffFlat !== 0) {
              (buffedStats as any)[stat] = ((buffedStats as any)[stat] || baseValue) + (totalBuffFlat * multiplier);
            }
          }
        }
      }
    }

    // Then apply combat stat buffs/debuffs directly
    for (const [statType, buffs] of combatBuffsMap.entries()) {
      if (buffs.length === 0 || !(statType in buffedStats)) continue;

      const baseValue = (baseStats as any)[statType] || 0;
      let currentValue = baseValue;
      
      // For debuffs (negative values or target='enemy'), we reduce the stat
      // Note: debuffs are already applied to opponent's buff map, so we just process them normally

      // Group buffs by stack_type (default: additive for percentage, flat for flat)
      const additiveBuffs = buffs.filter(b => !b.stack_type || b.stack_type === 'additive');
      const multiplicativeBuffs = buffs.filter(b => b.stack_type === 'multiplicative');

      // Process additive buffs first
      let additivePercentage = 0;
      let additiveFlat = 0;

      for (const buff of additiveBuffs) {
        if (buff.value_type === 'percentage') {
          additivePercentage += buff.value; // Stack percentages additively
        } else {
          additiveFlat += buff.value; // Stack flat values additively
        }
      }

      // Apply additive percentage to base value
      if (additivePercentage !== 0) {
        currentValue = baseValue * (1 + additivePercentage / 100);
      }

      // Apply additive flat value
      currentValue += additiveFlat;

      // Process multiplicative buffs (applied after additive)
      for (const buff of multiplicativeBuffs) {
        if (buff.value_type === 'percentage') {
          currentValue *= (1 + buff.value / 100); // Stack multiplicatively
        } else {
          // Flat value for multiplicative - treat as percentage of current value
          if (currentValue > 0) {
            currentValue *= (1 + buff.value / currentValue);
          }
        }
      }

      (buffedStats as any)[statType] = Math.max(0, Math.floor(currentValue));
    }

    return buffedStats;
  }

  /**
   * Update buff durations and remove expired buffs
   */
  private updateBuffsDuration(buffsMap: Map<string, BuffEffect[]>): void {
    for (const [statType, buffs] of buffsMap.entries()) {
      const activeBuffs = buffs.filter(buff => {
        if (buff.duration_rounds === undefined) {
          return true; // Permanent buff
        }
        buff.duration_rounds = (buff.duration_rounds || 0) - 1;
        return buff.duration_rounds > 0;
      });

      if (activeBuffs.length > 0) {
        buffsMap.set(statType, activeBuffs);
      } else {
        buffsMap.delete(statType);
      }
    }
  }
}

