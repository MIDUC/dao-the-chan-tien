/**
 * Stats Modifier Interface
 * 
 * Represents how a modifier affects character stats
 * Supports both flat (additive) and multiplier (percentage) bonuses
 */
export interface StatsModifier {
  /**
   * Flat bonuses (added to base)
   * Example: { atk: 50, def: 30 } means +50 attack, +30 defense
   */
  flat?: Partial<BaseStats>;

  /**
   * Multiplier bonuses (percentage, as decimal)
   * Example: { atk: 0.5 } means +50% attack (1 + 0.5 = 1.5x)
   * Example: { atk: 2.5 } means +250% attack (1 + 2.5 = 3.5x)
   */
  mult?: Partial<BaseStats>;

  /**
   * Final fix bonuses (applied after all calculations)
   * Rarely used, for special temporary buffs
   */
  finalFix?: Partial<BaseStats>;
}

/**
 * Base stats structure
 * All stats are numbers representing the raw value
 */
export interface BaseStats {
  // Primary combat stats
  atk: number; // Attack / Công kích
  def: number; // Defense / Phòng thủ
  hp: number; // Health Points / Sinh lực
  mp: number; // Mana Points / Linh khí

  // Secondary stats
  crit: number; // Critical Rate / Tỷ lệ bạo kích (%)
  critDmg: number; // Critical Damage / Sát thương bạo kích (%)
  dodge: number; // Dodge Rate / Tỷ lệ né tránh (%)
  accuracy: number; // Accuracy / Độ chính xác (%)

  // Elemental stats (for Tu Tien game)
  fireAtk?: number; // Fire Attack
  waterAtk?: number; // Water Attack
  earthAtk?: number; // Earth Attack
  woodAtk?: number; // Wood Attack
  metalAtk?: number; // Metal Attack
}

/**
 * Final stats (calculated from base + modifiers)
 */
export interface FinalStats extends BaseStats {
  // Can add computed stats here if needed
  // e.g., effectiveHp: number; // HP after defense calculations
}

/**
 * Stats calculation result
 */
export interface StatsCalculationResult {
  base: BaseStats;
  flatBonus: BaseStats;
  percentBonus: Partial<BaseStats>; // Multipliers as percentages
  finalStats: FinalStats;
}

