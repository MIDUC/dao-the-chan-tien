import { Item, ItemType } from '../entities/item.entity';

/**
 * Utility functions for randomizing item stats
 * Based on the hybrid design: Item Template (base_config) -> Item Instance (specific_stats)
 */

interface BaseConfig {
  strength_min?: number;
  strength_max?: number;
  agility_min?: number;
  agility_max?: number;
  wisdom_min?: number;
  wisdom_max?: number;
  hp_min?: number;
  hp_max?: number;
  defense_min?: number;
  defense_max?: number;
  can_refine?: boolean;
  can_socket?: boolean;
}

interface SpecificStats {
  strength?: number;
  agility?: number;
  wisdom?: number;
  hp?: number;
  defense?: number;
  enhancement_level?: number;
  durability?: number;
  sockets?: string[];
  hidden_options?: any;
}

/**
 * Random number between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random stats for equipment based on base_config
 * If base_config exists, use it. Otherwise, use equipment_stats as fixed values
 */
export function generateEquipmentStats(item: Item): SpecificStats | null {
  if (item.item_type !== ItemType.EQUIPMENT) {
    return null; // Only equipment needs random stats
  }

  const stats: SpecificStats = {
    enhancement_level: 0,
    durability: 100,
  };

  // If base_config exists, randomize stats
  if (item.base_config) {
    const config = item.base_config as BaseConfig;

    if (config.strength_min !== undefined && config.strength_max !== undefined) {
      stats.strength = randomInt(config.strength_min, config.strength_max);
    }
    if (config.agility_min !== undefined && config.agility_max !== undefined) {
      stats.agility = randomInt(config.agility_min, config.agility_max);
    }
    if (config.wisdom_min !== undefined && config.wisdom_max !== undefined) {
      stats.wisdom = randomInt(config.wisdom_min, config.wisdom_max);
    }
    if (config.hp_min !== undefined && config.hp_max !== undefined) {
      stats.hp = randomInt(config.hp_min, config.hp_max);
    }
    if (config.defense_min !== undefined && config.defense_max !== undefined) {
      stats.defense = randomInt(config.defense_min, config.defense_max);
    }

    // Initialize sockets if can_socket is true
    if (config.can_socket) {
      stats.sockets = [];
    }
  } else if (item.equipment_stats) {
    // Fallback: use equipment_stats as fixed values (no randomization)
    // This is for backward compatibility
    stats.strength = item.equipment_stats.strength;
    stats.agility = item.equipment_stats.agility;
    stats.wisdom = item.equipment_stats.wisdom;
    stats.hp = item.equipment_stats.hp;
    stats.defense = item.equipment_stats.defense;
  }

  return stats;
}

/**
 * Create base_config from equipment_stats (for migration/backward compatibility)
 * Converts fixed stats to a range (e.g., 50 -> 45-55, ±10%)
 */
export function createBaseConfigFromStats(
  equipmentStats: {
    strength?: number;
    agility?: number;
    wisdom?: number;
    hp?: number;
    defense?: number;
  },
  variancePercent: number = 10,
): BaseConfig {
  const config: BaseConfig = {};

  if (equipmentStats.strength) {
    const variance = Math.floor((equipmentStats.strength * variancePercent) / 100);
    config.strength_min = Math.max(1, equipmentStats.strength - variance);
    config.strength_max = equipmentStats.strength + variance;
  }
  if (equipmentStats.agility) {
    const variance = Math.floor((equipmentStats.agility * variancePercent) / 100);
    config.agility_min = Math.max(1, equipmentStats.agility - variance);
    config.agility_max = equipmentStats.agility + variance;
  }
  if (equipmentStats.wisdom) {
    const variance = Math.floor((equipmentStats.wisdom * variancePercent) / 100);
    config.wisdom_min = Math.max(1, equipmentStats.wisdom - variance);
    config.wisdom_max = equipmentStats.wisdom + variance;
  }
  if (equipmentStats.hp) {
    const variance = Math.floor((equipmentStats.hp * variancePercent) / 100);
    config.hp_min = Math.max(1, equipmentStats.hp - variance);
    config.hp_max = equipmentStats.hp + variance;
  }
  if (equipmentStats.defense) {
    const variance = Math.floor((equipmentStats.defense * variancePercent) / 100);
    config.defense_min = Math.max(1, equipmentStats.defense - variance);
    config.defense_max = equipmentStats.defense + variance;
  }

  return config;
}

