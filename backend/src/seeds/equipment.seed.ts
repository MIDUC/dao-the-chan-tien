import { Repository } from 'typeorm';
import { Item, ItemType, ItemRarity } from '../entities/item.entity';
import { EquipmentSlot } from '../entities/equipment.entity';
import { createBaseConfigFromStats } from '../utils/item-random.util';

/**
 * Generate hundreds of equipment items with all rarity levels
 * Each equipment will have base_config for random stats
 */

function getRarityLabel(rarity: ItemRarity): string {
  const labels: Record<ItemRarity, string> = {
    [ItemRarity.COMMON]: 'Thường',
    [ItemRarity.UNCOMMON]: 'Lục',
    [ItemRarity.RARE]: 'Lam',
    [ItemRarity.EPIC]: 'Tím',
    [ItemRarity.LEGENDARY]: 'Vàng',
    [ItemRarity.MYTHIC]: 'Đỏ',
  };
  return labels[rarity];
}

export async function seedEquipment(
  itemRepo: Repository<Item>,
): Promise<Item[]> {
  const items: Partial<Item>[] = [];

  // Helper function to create equipment with all rarity levels
  const createEquipmentVariants = (
    baseName: string,
    baseDescription: string,
    slot: EquipmentSlot,
    category: string,
    iconUrl: string,
    baseStats: {
      strength?: number;
      agility?: number;
      wisdom?: number;
      hp?: number;
      defense?: number;
    },
    basePrice: number = 50,
  ) => {
    const rarities = [
      { rarity: ItemRarity.COMMON, grade: 1, multiplier: 1, nameSuffix: '' },
      {
        rarity: ItemRarity.UNCOMMON,
        grade: 2,
        multiplier: 1.5,
        nameSuffix: ' [Lục]',
      },
      { rarity: ItemRarity.RARE, grade: 3, multiplier: 2, nameSuffix: ' [Lam]' },
      { rarity: ItemRarity.EPIC, grade: 4, multiplier: 3, nameSuffix: ' [Tím]' },
      {
        rarity: ItemRarity.LEGENDARY,
        grade: 5,
        multiplier: 5,
        nameSuffix: ' [Vàng]',
      },
      { rarity: ItemRarity.MYTHIC, grade: 6, multiplier: 10, nameSuffix: ' [Đỏ]' },
    ];

    rarities.forEach(({ rarity, grade, multiplier, nameSuffix }) => {
      const stats = { ...baseStats };
      Object.keys(stats).forEach((key) => {
        stats[key] = Math.floor(stats[key] * multiplier);
      });

      items.push({
        name: `${baseName}${nameSuffix}`,
        description: `${baseDescription} (Phẩm cấp: ${getRarityLabel(rarity)})`,
        item_type: ItemType.EQUIPMENT,
        category: `${category}_${rarity}`,
        grade,
        rarity,
        icon_url: iconUrl,
        max_stack: 1, // Equipment cannot stack
        sellable: true,
        sell_price: Math.floor(basePrice * multiplier),
        usable: false,
        equipment_slot: slot,
        equipment_stats: stats, // Base stats for display
        base_config: createBaseConfigFromStats(stats, 10), // Random range ±10%
        required_level: Math.floor(grade * 2),
        required_realm_level: Math.max(1, Math.floor(grade / 2)),
        is_active: true,
      });
    });
  };

  // ========== WEAPONS (Vũ khí) ==========
  // Swords
  createEquipmentVariants(
    'Mộc Kiếm',
    'Kiếm gỗ cơ bản, có linh khí bao quanh',
    EquipmentSlot.WEAPON,
    'weapon_sword_wood',
    'moc_kiem.png',
    { strength: 5, agility: 2 },
    50,
  );

  createEquipmentVariants(
    'Thiết Kiếm',
    'Kiếm sắt thường, sắc bén',
    EquipmentSlot.WEAPON,
    'weapon_sword_iron',
    'thiet_kiem.png',
    { strength: 10, agility: 5 },
    100,
  );

  createEquipmentVariants(
    'Bạch Ngân Kiếm',
    'Kiếm bạc tinh khiết, linh khí dày đặc',
    EquipmentSlot.WEAPON,
    'weapon_sword_silver',
    'bach_ngan_kiem.png',
    { strength: 20, agility: 10, wisdom: 5 },
    200,
  );

  createEquipmentVariants(
    'Huyết Ma Kiếm',
    'Kiếm ma đạo, thấm đẫm huyết khí',
    EquipmentSlot.WEAPON,
    'weapon_sword_blood',
    'huyet_ma_kiem.png',
    { strength: 30, agility: 15, hp: 50 },
    300,
  );

  createEquipmentVariants(
    'Thiên Kiếm',
    'Kiếm thiên đạo, uy lực vô song',
    EquipmentSlot.WEAPON,
    'weapon_sword_heaven',
    'thien_kiem.png',
    { strength: 50, agility: 25, wisdom: 20 },
    500,
  );

  // Spears
  createEquipmentVariants(
    'Mộc Thương',
    'Thương gỗ, đơn giản nhưng hiệu quả',
    EquipmentSlot.WEAPON,
    'weapon_spear_wood',
    'moc_thuong.png',
    { strength: 6, agility: 3 },
    60,
  );

  createEquipmentVariants(
    'Thiết Thương',
    'Thương sắt, uy lực mạnh mẽ',
    EquipmentSlot.WEAPON,
    'weapon_spear_iron',
    'thiet_thuong.png',
    { strength: 15, agility: 8 },
    150,
  );

  createEquipmentVariants(
    'Lôi Điện Thương',
    'Thương lôi điện, sấm sét vang trời',
    EquipmentSlot.WEAPON,
    'weapon_spear_lightning',
    'loi_dien_thuong.png',
    { strength: 35, agility: 20, wisdom: 15 },
    350,
  );

  // Staffs
  createEquipmentVariants(
    'Mộc Trượng',
    'Trượng gỗ, phù hợp cho pháp sư',
    EquipmentSlot.WEAPON,
    'weapon_staff_wood',
    'moc_truong.png',
    { wisdom: 8, agility: 2 },
    60,
  );

  createEquipmentVariants(
    'Linh Trượng',
    'Trượng linh khí, tăng cường pháp lực',
    EquipmentSlot.WEAPON,
    'weapon_staff_spirit',
    'linh_truong.png',
    { wisdom: 20, agility: 5, hp: 30 },
    200,
  );

  createEquipmentVariants(
    'Cửu Thiên Pháp Trượng',
    'Trượng pháp thuật tối thượng',
    EquipmentSlot.WEAPON,
    'weapon_staff_heaven',
    'cuu_thien_phap_truong.png',
    { wisdom: 60, agility: 15, hp: 100 },
    600,
  );

  // Bows
  createEquipmentVariants(
    'Mộc Cung',
    'Cung gỗ, dễ sử dụng',
    EquipmentSlot.WEAPON,
    'weapon_bow_wood',
    'moc_cung.png',
    { agility: 10, strength: 3 },
    70,
  );

  createEquipmentVariants(
    'Linh Cung',
    'Cung linh khí, độ chính xác cao',
    EquipmentSlot.WEAPON,
    'weapon_bow_spirit',
    'linh_cung.png',
    { agility: 25, strength: 10, wisdom: 5 },
    250,
  );

  // ========== ARMOR (Giáp) ==========
  // Light Armor
  createEquipmentVariants(
    'Vải Bố Giáp',
    'Áo giáp vải bố, phòng thủ cơ bản',
    EquipmentSlot.ARMOR,
    'armor_cloth',
    'vai_bo_giap.png',
    { defense: 5, agility: 3 },
    40,
  );

  createEquipmentVariants(
    'Thiết Giáp',
    'Áo giáp sắt, phòng thủ tốt',
    EquipmentSlot.ARMOR,
    'armor_iron',
    'thiet_giap.png',
    { defense: 15, strength: 5 },
    150,
  );

  createEquipmentVariants(
    'Bạch Ngân Giáp',
    'Áo giáp bạc, vừa đẹp vừa mạnh',
    EquipmentSlot.ARMOR,
    'armor_silver',
    'bach_ngan_giap.png',
    { defense: 30, strength: 10, agility: 8 },
    300,
  );

  createEquipmentVariants(
    'Huyết Ma Giáp',
    'Áo giáp ma đạo, phòng thủ cực mạnh',
    EquipmentSlot.ARMOR,
    'armor_blood',
    'huyet_ma_giap.png',
    { defense: 50, strength: 20, hp: 100 },
    500,
  );

  createEquipmentVariants(
    'Thiên Giáp',
    'Áo giáp thiên đạo, bảo vệ hoàn hảo',
    EquipmentSlot.ARMOR,
    'armor_heaven',
    'thien_giap.png',
    { defense: 80, strength: 30, hp: 200, wisdom: 15 },
    800,
  );

  // Heavy Armor
  createEquipmentVariants(
    'Trọng Giáp',
    'Áo giáp nặng, phòng thủ cao nhưng chậm',
    EquipmentSlot.ARMOR,
    'armor_heavy',
    'trong_giap.png',
    { defense: 25, strength: 15, agility: -5 },
    250,
  );

  createEquipmentVariants(
    'Long Giáp',
    'Áo giáp rồng, uy lực vô song',
    EquipmentSlot.ARMOR,
    'armor_dragon',
    'long_giap.png',
    { defense: 70, strength: 35, hp: 150 },
    700,
  );

  // ========== ACCESSORIES (Phụ kiện) ==========
  // Rings
  createEquipmentVariants(
    'Đồng Nhẫn',
    'Nhẫn đồng, tăng chút linh lực',
    EquipmentSlot.RING_1,
    'accessory_ring_copper',
    'dong_nhan.png',
    { wisdom: 3, hp: 10 },
    30,
  );

  createEquipmentVariants(
    'Bạc Nhẫn',
    'Nhẫn bạc, linh lực dồi dào',
    EquipmentSlot.RING_1,
    'accessory_ring_silver',
    'bac_nhan.png',
    { wisdom: 10, hp: 30, agility: 5 },
    100,
  );

  createEquipmentVariants(
    'Vàng Nhẫn',
    'Nhẫn vàng, linh lực cường đại',
    EquipmentSlot.RING_1,
    'accessory_ring_gold',
    'vang_nhan.png',
    { wisdom: 25, hp: 80, agility: 12 },
    250,
  );

  // Necklaces
  createEquipmentVariants(
    'Ngọc Bội',
    'Ngọc bội cơ bản, tăng linh khí',
    EquipmentSlot.NECKLACE,
    'accessory_necklace_jade',
    'ngoc_boi.png',
    { wisdom: 5, hp: 20 },
    50,
  );

  createEquipmentVariants(
    'Thiên Ngọc Bội',
    'Ngọc bội thiên đạo, linh khí vô tận',
    EquipmentSlot.NECKLACE,
    'accessory_necklace_heaven',
    'thien_ngoc_boi.png',
    { wisdom: 40, hp: 150, strength: 20 },
    400,
  );

  // Boots
  createEquipmentVariants(
    'Vải Giày',
    'Giày vải, nhẹ nhàng',
    EquipmentSlot.BOOTS,
    'armor_boots_cloth',
    'vai_giay.png',
    { agility: 5, defense: 2 },
    30,
  );

  createEquipmentVariants(
    'Thiết Giày',
    'Giày sắt, bền chắc',
    EquipmentSlot.BOOTS,
    'armor_boots_iron',
    'thiet_giay.png',
    { agility: 12, defense: 8, strength: 5 },
    120,
  );

  createEquipmentVariants(
    'Linh Giày',
    'Giày linh khí, nhanh như gió',
    EquipmentSlot.BOOTS,
    'armor_boots_spirit',
    'linh_giay.png',
    { agility: 30, defense: 15, wisdom: 10 },
    300,
  );

  // Helmets
  createEquipmentVariants(
    'Vải Mũ',
    'Mũ vải, bảo vệ đầu cơ bản',
    EquipmentSlot.HELMET,
    'armor_helmet_cloth',
    'vai_mu.png',
    { defense: 3, hp: 10 },
    25,
  );

  createEquipmentVariants(
    'Thiết Mũ',
    'Mũ sắt, bảo vệ tốt',
    EquipmentSlot.HELMET,
    'armor_helmet_iron',
    'thiet_mu.png',
    { defense: 10, hp: 30, strength: 3 },
    100,
  );

  createEquipmentVariants(
    'Long Mũ',
    'Mũ rồng, uy lực mạnh mẽ',
    EquipmentSlot.HELMET,
    'armor_helmet_dragon',
    'long_mu.png',
    { defense: 35, hp: 100, strength: 15, wisdom: 10 },
    350,
  );

  const savedItems = await itemRepo.save(items);
  console.log(`✅ Created ${savedItems.length} equipment items`);

  return savedItems;
}

