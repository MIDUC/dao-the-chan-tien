import { BaseStats, StatsModifier } from '../types/stats-modifier.interface';

/**
 * Merge multiple stats modifiers into a single modifier
 * Useful when combining equipment, talents, artifacts, etc.
 */
export function mergeStatsModifiers(
  modifiers: StatsModifier[],
): StatsModifier {
  const result: StatsModifier = {
    flat: {},
    mult: {},
    finalFix: {},
  };

  for (const modifier of modifiers) {
    // Merge flat bonuses
    if (modifier.flat) {
      for (const [key, value] of Object.entries(modifier.flat)) {
        if (value !== undefined) {
          if (!result.flat) result.flat = {};
          result.flat[key as keyof BaseStats] =
            (result.flat[key as keyof BaseStats] || 0) + value;
        }
      }
    }

    // Merge multipliers (additive, then applied as multiplication)
    if (modifier.mult) {
      for (const [key, value] of Object.entries(modifier.mult)) {
        if (value !== undefined) {
          if (!result.mult) result.mult = {};
          result.mult[key as keyof BaseStats] =
            (result.mult[key as keyof BaseStats] || 0) + value;
        }
      }
    }

    // Merge final fixes
    if (modifier.finalFix) {
      for (const [key, value] of Object.entries(modifier.finalFix)) {
        if (value !== undefined) {
          if (!result.finalFix) result.finalFix = {};
          result.finalFix[key as keyof BaseStats] =
            (result.finalFix[key as keyof BaseStats] || 0) + value;
        }
      }
    }
  }

  return result;
}

/**
 * Calculate final stats using the 3-layer formula:
 * FinalStat = (Base + FlatBonus) × (1 + PercentBonus) + FinalFix
 */
export function calculateFinalStats(
  base: BaseStats,
  modifier: StatsModifier,
): BaseStats {
  const result: BaseStats = { ...base };

  // Apply formula for each stat
  for (const key of Object.keys(base) as Array<keyof BaseStats>) {
    const baseValue = base[key] || 0;
    const flatBonus = modifier.flat?.[key] || 0;
    const percentBonus = modifier.mult?.[key] || 0;
    const finalFix = modifier.finalFix?.[key] || 0;

    // Formula: (Base + Flat) × (1 + Percent) + FinalFix
    const calculated = Math.floor(
      (baseValue + flatBonus) * (1 + percentBonus) + finalFix,
    );

    result[key] = calculated;
  }

  return result;
}

/**
 * Create a zero stats object
 */
export function createZeroStats(): BaseStats {
  return {
    atk: 0,
    def: 0,
    hp: 0,
    mp: 0,
    crit: 0,
    critDmg: 0,
    dodge: 0,
    accuracy: 0,
  };
}

/**
 * Clone stats object
 */
export function cloneStats<T extends BaseStats>(stats: T): T {
  return { ...stats };
}

