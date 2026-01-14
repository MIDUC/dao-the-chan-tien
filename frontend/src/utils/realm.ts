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
  if (!lastRealm) {
    // Should never happen, but TypeScript requires this check
    return {
      name: 'Unknown',
      tier: 1,
      level: realmLevel,
    };
  }
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

