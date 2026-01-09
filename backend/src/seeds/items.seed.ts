import { Repository } from 'typeorm';
import { Item, ItemType, ItemRarity } from '../entities/item.entity';
import { EquipmentSlot } from '../entities/equipment.entity';
import { createBaseConfigFromStats } from '../utils/item-random.util';

/**
 * Generate items with all rarity levels for each base item
 * Rarity mapping:
 * - COMMON (Thường)
 * - UNCOMMON (Không thường)
 * - RARE (Hiếm)
 * - EPIC (Sử thi)
 * - LEGENDARY (Huyền thoại)
 * - MYTHIC (Thần thoại)
 */
export async function seedItems(itemRepo: Repository<Item>): Promise<Item[]> {
  const items: Partial<Item>[] = [];

  // Helper function to create items with all rarity levels
  const createItemVariants = (
    baseName: string,
    baseDescription: string,
    itemType: ItemType,
    category: string,
    iconUrl: string,
    baseStats: any = {},
    basePrice: number = 10,
  ) => {
    const rarities = [
      { rarity: ItemRarity.COMMON, grade: 1, multiplier: 1, nameSuffix: '' },
      {
        rarity: ItemRarity.UNCOMMON,
        grade: 2,
        multiplier: 1.5,
        nameSuffix: '',
      },
      {
        rarity: ItemRarity.RARE,
        grade: 3,
        multiplier: 2,
        nameSuffix: '',
      },
      {
        rarity: ItemRarity.EPIC,
        grade: 4,
        multiplier: 3,
        nameSuffix: '',
      },
      {
        rarity: ItemRarity.LEGENDARY,
        grade: 5,
        multiplier: 5,
        nameSuffix: '',
      },
      {
        rarity: ItemRarity.MYTHIC,
        grade: 6,
        multiplier: 10,
        nameSuffix: '',
      },
    ];

    rarities.forEach(({ rarity, grade, multiplier, nameSuffix }) => {
      const stats = { ...baseStats };
      Object.keys(stats).forEach((key) => {
        stats[key] = Math.floor(stats[key] * multiplier);
      });

      const finalStats = itemType === ItemType.EQUIPMENT ? stats : null;

      items.push({
        name: `${baseName}${nameSuffix}`,
        description: `${baseDescription} (Phẩm cấp: ${getRarityLabel(rarity)})`,
        item_type: itemType,
        category: `${category}_${rarity}`,
        grade,
        rarity,
        icon_url: iconUrl,
        max_stack: itemType === ItemType.EQUIPMENT ? 1 : 999,
        sellable: true,
        sell_price: Math.floor(basePrice * multiplier),
        usable: itemType === ItemType.CONSUMABLE,
        equipment_slot:
          itemType === ItemType.EQUIPMENT
            ? category.startsWith('weapon')
              ? EquipmentSlot.WEAPON
              : EquipmentSlot.ARMOR
            : undefined,
        equipment_stats: finalStats, // Base stats (for display/reference)
        // Create base_config for random stats (10% variance)
        base_config:
          itemType === ItemType.EQUIPMENT && finalStats
            ? createBaseConfigFromStats(finalStats, 10)
            : undefined,
        required_level: Math.floor(grade * 2),
        required_realm_level: Math.max(1, Math.floor(grade / 2)),
        is_active: true,
      });
    });
  };

  // Mộc Kiếm (Weapon)
  createItemVariants(
    'Mộc Kiếm',
    'Kiếm gỗ cơ bản, có linh khí bao quanh',
    ItemType.EQUIPMENT,
    'weapon_sword',
    'moc_kiem.png',
    { strength: 5, agility: 2 },
    50,
  );

  // Đá Thuộc Tính - Băng (Material)
  createItemVariants(
    'Đá Thuộc Tính Băng',
    'Đá nguyên tố băng, nguyên liệu luyện đan',
    ItemType.MATERIAL,
    'material_ice',
    'da_thuoc_tinh_bang.png',
    {},
    10,
  );

  // Đá Thuộc Tính - Hỏa (Material)
  createItemVariants(
    'Đá Thuộc Tính Hỏa',
    'Đá nguyên tố hỏa, nguyên liệu luyện đan',
    ItemType.MATERIAL,
    'material_fire',
    'da_thuoc_tinh_hoa.png',
    {},
    10,
  );

  // Đá Thuộc Tính - Lôi (Material)
  createItemVariants(
    'Đá Thuộc Tính Lôi',
    'Đá nguyên tố lôi, nguyên liệu luyện đan',
    ItemType.MATERIAL,
    'material_lightning',
    'da_thuoc_tinh_loi.png',
    {},
    10,
  );

  // Đá Thuộc Tính - Mộc (Material)
  createItemVariants(
    'Đá Thuộc Tính Mộc',
    'Đá nguyên tố mộc, nguyên liệu luyện đan',
    ItemType.MATERIAL,
    'material_wood',
    'da_thuoc_tinh_moc.png',
    {},
    10,
  );

  // Băng Hoa Lương Nghi Giáp (Armor)
  createItemVariants(
    'Băng Hoa Lương Nghi Giáp',
    'Áo giáp băng tuyết, tăng phòng thủ và linh lực',
    ItemType.EQUIPMENT,
    'armor_ice',
    'bang_hoa_luong_nghi_giap.png',
    { defense: 10, wisdom: 3 },
    150,
  );

  // Cửu Thiên Lôi Giáp (Armor)
  createItemVariants(
    'Cửu Thiên Lôi Giáp',
    'Áo giáp lôi điện, tăng phòng thủ và nhanh nhẹn',
    ItemType.EQUIPMENT,
    'armor_lightning',
    'cuu_thien_loi_giap.png',
    { defense: 12, agility: 5 },
    200,
  );

  // Hàn Sương Băng Giáp (Armor)
  createItemVariants(
    'Hàn Sương Băng Giáp',
    'Áo giáp băng hàn, tăng phòng thủ và thể phách',
    ItemType.EQUIPMENT,
    'armor_frost',
    'han_suong_bang_giap.png',
    { defense: 15, strength: 4 },
    250,
  );

  // Hỏa Long Giáp (Armor)
  createItemVariants(
    'Hỏa Long Giáp',
    'Áo giáp hỏa long, tăng phòng thủ và sức mạnh',
    ItemType.EQUIPMENT,
    'armor_fire',
    'hoa_long_giap.png',
    { defense: 18, strength: 6 },
    300,
  );

  // Linh Thảo Cơ Bản (Material - Spirit Herb)
  createItemVariants(
    'Linh Thảo Cơ Bản',
    'Linh thảo thường gặp, có linh khí yếu, dùng để luyện đan cơ bản',
    ItemType.MATERIAL,
    'material_herb_basic',
    'linh_thao_co_ban.png',
    {},
    15,
  );

  // Linh Thảo Ngàn Năm (Material - Spirit Herb)
  createItemVariants(
    'Linh Thảo Ngàn Năm',
    'Linh thảo đã sống ngàn năm, linh khí dồi dào, nguyên liệu quý cho luyện đan',
    ItemType.MATERIAL,
    'material_herb_thousand',
    'linh_thao_ngan_nam.png',
    {},
    50,
  );

  // Linh Thảo Vạn Năm (Material - Spirit Herb)
  createItemVariants(
    'Linh Thảo Vạn Năm',
    'Linh thảo cổ xưa vạn năm tuổi, linh khí cực mạnh, hiếm có khó tìm',
    ItemType.MATERIAL,
    'material_herb_ten_thousand',
    'linh_thao_van_nam.png',
    {},
    150,
  );

  // Linh Thảo Thần Thảo (Material - Spirit Herb)
  createItemVariants(
    'Linh Thảo Thần Thảo',
    'Thần thảo thiên địa, linh khí tinh thuần, chỉ có ở nơi linh khí cực thịnh',
    ItemType.MATERIAL,
    'material_herb_divine',
    'linh_thao_than_thao.png',
    {},
    500,
  );

  // Linh Thảo Hỏa Diễm (Material - Fire Spirit Herb)
  createItemVariants(
    'Linh Thảo Hỏa Diễm',
    'Linh thảo mang thuộc tính hỏa, toả ra hơi nóng, dùng luyện đan hỏa tính',
    ItemType.MATERIAL,
    'material_herb_fire',
    'linh_thao_hoa_diem.png',
    {},
    30,
  );

  // Linh Thảo Băng Tuyết (Material - Ice Spirit Herb)
  createItemVariants(
    'Linh Thảo Băng Tuyết',
    'Linh thảo mang thuộc tính băng, lạnh như băng tuyết, dùng luyện đan băng tính',
    ItemType.MATERIAL,
    'material_herb_ice',
    'linh_thao_bang_tuyet.png',
    {},
    30,
  );

  // Linh Thảo Lôi Điện (Material - Lightning Spirit Herb)
  createItemVariants(
    'Linh Thảo Lôi Điện',
    'Linh thảo mang thuộc tính lôi, có tia điện lóe sáng, dùng luyện đan lôi tính',
    ItemType.MATERIAL,
    'material_herb_lightning',
    'linh_thao_loi_dien.png',
    {},
    30,
  );

  // Linh Thảo Sinh Mệnh (Material - Life Spirit Herb)
  createItemVariants(
    'Linh Thảo Sinh Mệnh',
    'Linh thảo chứa sức sống dồi dào, có thể hồi phục sinh mệnh, cực kỳ quý hiếm',
    ItemType.MATERIAL,
    'material_herb_life',
    'linh_thao_sinh_menh.png',
    {},
    200,
  );

  // Linh Thảo Hồn Phách (Material - Soul Spirit Herb)
  createItemVariants(
    'Linh Thảo Hồn Phách',
    'Linh thảo tăng cường hồn phách, giúp tu vi tăng nhanh, bảo vật tu tiên',
    ItemType.MATERIAL,
    'material_herb_soul',
    'linh_thao_hon_phach.png',
    {},
    300,
  );

  const savedItems = await itemRepo.save(items);
  console.log(`✅ Created ${savedItems.length} items with all rarity levels`);
  return savedItems;
}

function getRarityLabel(rarity: ItemRarity): string {
  const labelMap: Record<ItemRarity, string> = {
    [ItemRarity.COMMON]: 'Thường',
    [ItemRarity.UNCOMMON]: 'Không thường',
    [ItemRarity.RARE]: 'Hiếm',
    [ItemRarity.EPIC]: 'Sử thi',
    [ItemRarity.LEGENDARY]: 'Huyền thoại',
    [ItemRarity.MYTHIC]: 'Thần thoại',
  };
  return labelMap[rarity] || rarity;
}
