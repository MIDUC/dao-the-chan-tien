import { Repository } from 'typeorm';
import { Shop, ShopType } from '../entities/shop.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { Item, ItemRarity } from '../entities/item.entity';

/**
 * Seed shops and shop items
 * Shop price can be different from item sell_price
 */
export async function seedShops(
  shopRepo: Repository<Shop>,
  shopItemRepo: Repository<ShopItem>,
  items: Item[],
): Promise<{ shops: Shop[]; shopItems: ShopItem[] }> {
  // Create shops
  const shops: Partial<Shop>[] = [
    {
      name: 'Cửa Hàng Vật Phẩm',
      description: 'Cửa hàng bán các vật phẩm cơ bản',
      shop_type: ShopType.NPC_SHOP,
      npc_id: undefined,
      is_active: true,
    },
    {
      name: 'Cửa Hàng Trang Bị',
      description: 'Cửa hàng chuyên bán trang bị',
      shop_type: ShopType.NPC_SHOP,
      npc_id: undefined,
      is_active: true,
    },
    {
      name: 'Cửa Hàng Nguyên Liệu',
      description: 'Cửa hàng bán nguyên liệu luyện đan',
      shop_type: ShopType.NPC_SHOP,
      npc_id: undefined,
      is_active: true,
    },
  ];

  const savedShops = await shopRepo.save(shops);
  console.log(`✅ Created ${savedShops.length} shops`);

  // Create shop items
  const shopItems: Partial<ShopItem>[] = [];

  // Helper to calculate shop price (usually 1.2x - 1.5x of base sell_price)
  const calculateShopPrice = (item: Item, priceMultiplier: number = 1.3): number => {
    const basePrice = item.sell_price || 10;
    return Math.floor(basePrice * priceMultiplier);
  };

  // Helper to determine currency type based on rarity
  const getCurrencyType = (rarity: ItemRarity): string => {
    if (rarity === ItemRarity.MYTHIC || rarity === ItemRarity.LEGENDARY) {
      return 'immortal_jade'; // Premium currency for high tier items
    }
    if (rarity === ItemRarity.EPIC) {
      return 'essence'; // Premium currency for epic items
    }
    return 'ling_stone'; // Common currency for normal items
  };

  // Add items to shops based on type
  const materialShop = savedShops.find((s) => s.name === 'Cửa Hàng Nguyên Liệu');
  const equipmentShop = savedShops.find((s) => s.name === 'Cửa Hàng Trang Bị');
  const generalShop = savedShops.find((s) => s.name === 'Cửa Hàng Vật Phẩm');

  // Filter items by type
  const equipmentItems = items.filter((item) => item.item_type === 'equipment');
  const materialItems = items.filter((item) => item.item_type === 'material');

  // Add ALL materials to Material Shop
  materialItems.forEach((item) => {
    if (materialShop) {
      shopItems.push({
        shop_id: materialShop.id,
        item_id: item.id,
        price: calculateShopPrice(item, 1.2), // 20% markup for materials
        currency_type: getCurrencyType(item.rarity),
        stock: undefined, // Unlimited stock
        daily_limit: undefined, // No daily limit
        is_active: true,
      });
    }
  });

  // Add ONLY 30 equipment items to Equipment Shop (random selection)
  // Select 30 items from different categories and rarities
  const selectedEquipment: Item[] = [];
  const rarities = [
    ItemRarity.COMMON,
    ItemRarity.UNCOMMON,
    ItemRarity.RARE,
    ItemRarity.EPIC,
    ItemRarity.LEGENDARY,
    ItemRarity.MYTHIC,
  ];

  // Select items to ensure variety (5 per rarity = 30 total)
  for (const rarity of rarities) {
    const rarityItems = equipmentItems.filter((item) => item.rarity === rarity);
    // Take up to 5 items per rarity
    const itemsToTake = rarityItems.slice(0, 5);
    selectedEquipment.push(...itemsToTake);
  }

  // If we have less than 30, add more random items
  while (
    selectedEquipment.length < 30 &&
    selectedEquipment.length < equipmentItems.length
  ) {
    const randomItem =
      equipmentItems[Math.floor(Math.random() * equipmentItems.length)];
    if (!selectedEquipment.find((item) => item.id === randomItem.id)) {
      selectedEquipment.push(randomItem);
    }
  }

  // Limit to exactly 30
  const finalSelected = selectedEquipment.slice(0, 30);

  // Add selected equipment to shop
  finalSelected.forEach((item) => {
    if (equipmentShop) {
      shopItems.push({
        shop_id: equipmentShop.id,
        item_id: item.id,
        price: calculateShopPrice(item, 1.5), // 50% markup for equipment
        currency_type: getCurrencyType(item.rarity),
        stock: undefined, // Unlimited stock
        daily_limit: undefined, // No daily limit
        is_active: true,
      });
    }
  });

  // Add some high-tier items to general shop (for convenience)
  equipmentItems
    .filter(
      (item) =>
        item.rarity === ItemRarity.LEGENDARY ||
        item.rarity === ItemRarity.MYTHIC,
    )
    .slice(0, 10) // Limit to 10 premium items
    .forEach((item) => {
      if (generalShop) {
        shopItems.push({
          shop_id: generalShop.id,
          item_id: item.id,
          price: calculateShopPrice(item, 2.0), // 100% markup for premium items
          currency_type: getCurrencyType(item.rarity),
          stock: 10, // Limited stock for premium items
          daily_limit: 1, // Limit 1 per day
          is_active: true,
        });
      }
    });

  const savedShopItems = await shopItemRepo.save(shopItems);
  console.log(`✅ Created ${savedShopItems.length} shop items`);

  return { shops: savedShops, shopItems: savedShopItems };
}

