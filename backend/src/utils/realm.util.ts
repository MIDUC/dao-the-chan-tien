/**
 * Realm system configuration
 * Each realm has multiple tiers (tầng)
 */
const REALM_CONFIG = [
  { name: 'Luyện Khí', tiers: 10, startLevel: 1 },
  { name: 'Trúc Cơ', tiers: 10, startLevel: 11 },
  { name: 'Kim Đan', tiers: 10, startLevel: 21 },
  { name: 'Nguyên Anh', tiers: 10, startLevel: 31 },
  { name: 'Hóa Thần', tiers: 10, startLevel: 41 },
  { name: 'Luyện Hư', tiers: 10, startLevel: 51 },
  { name: 'Hợp Thể', tiers: 10, startLevel: 61 },
  { name: 'Đại Thừa', tiers: 10, startLevel: 71 },
  { name: 'Độ Kiếp', tiers: 10, startLevel: 81 },
];

/**
 * Random EXP boost when breaking through to a new realm
 * Format: { realmName: [min, max] }
 */
export const REALM_BREAKTHROUGH_EXP_BOOST: Record<string, [number, number]> = {
  'Luyện Khí': [10, 20],
  'Trúc Cơ': [40, 60],
  'Kim Đan': [80, 120],
  'Nguyên Anh': [150, 200],
  'Hóa Thần': [250, 350],
  'Luyện Hư': [400, 550],
  'Hợp Thể': [600, 800],
  'Đại Thừa': [900, 1200],
  'Độ Kiếp': [1500, 2000],
};

export interface RealmInfo {
  name: string;
  tier: number;
  level: number;
}

/**
 * Convert realm_level to realm name and tier
 * @param realmLevel - The numeric realm level (1, 2, 3, ...)
 * @returns RealmInfo with name, tier, and level
 */
export function getRealmInfo(realmLevel: number): RealmInfo {
  for (const realm of REALM_CONFIG) {
    const endLevel = realm.startLevel + realm.tiers - 1;
    if (realmLevel >= realm.startLevel && realmLevel <= endLevel) {
      const tier = realmLevel - realm.startLevel + 1;
      return {
        name: realm.name,
        tier,
        level: realmLevel,
      };
    }
  }

  // Fallback: if level exceeds all realms, return the last realm
  const lastRealm = REALM_CONFIG[REALM_CONFIG.length - 1];
  const tier = realmLevel - lastRealm.startLevel + 1;
  return {
    name: lastRealm.name,
    tier: tier > lastRealm.tiers ? lastRealm.tiers : tier,
    level: realmLevel,
  };
}

/**
 * Format realm info to display string
 * @param realmLevel - The numeric realm level
 * @returns Formatted string like "Luyện Khí Tầng 3"
 */
export function formatRealm(realmLevel: number): string {
  const info = getRealmInfo(realmLevel);
  return `${info.name} Tầng ${info.tier}`;
}

/**
 * Get random EXP boost when breaking through to a new realm
 * @param realmName - Name of the realm (e.g., "Trúc Cơ")
 * @returns Random EXP boost value
 */
export function getRealmBreakthroughExpBoost(realmName: string): number {
  const range = REALM_BREAKTHROUGH_EXP_BOOST[realmName];
  if (!range) {
    // Default range if realm not found
    return 10;
  }
  const [min, max] = range;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if realm level up means breaking through to a new realm
 * @param oldLevel - Previous realm level
 * @param newLevel - New realm level
 * @returns Realm name if breaking through, null otherwise
 */
export function getBreakthroughRealm(oldLevel: number, newLevel: number): string | null {
  const oldRealm = getRealmInfo(oldLevel);
  const newRealm = getRealmInfo(newLevel);
  
  // If realm name changed, it's a breakthrough
  if (oldRealm.name !== newRealm.name) {
    return newRealm.name;
  }
  
  return null;
}

/**
 * Get inventory slots bonus when breaking through to a new realm
 * @param realmName - Name of the new realm
 * @returns Number of additional inventory slots
 */
export function getBreakthroughInventorySlots(realmName: string): number {
  // Each realm breakthrough gives +5 slots
  // Can be customized per realm if needed
  const slotsMap: Record<string, number> = {
    'Luyện Khí': 0, // Starting realm, no bonus
    'Trúc Cơ': 5,
    'Kim Đan': 5,
    'Nguyên Anh': 5,
    'Hóa Thần': 5,
    'Luyện Hư': 5,
    'Hợp Thể': 5,
    'Đại Thừa': 5,
    'Độ Kiếp': 5,
  };
  
  return slotsMap[realmName] || 0;
}