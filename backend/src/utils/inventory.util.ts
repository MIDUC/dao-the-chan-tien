import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Item, ItemType } from '../entities/item.entity';
import { generateEquipmentStats } from './item-random.util';

/**
 * Utility functions for adding items to inventory
 * Handles both stackable (materials) and non-stackable (equipment) items
 */

/**
 * Add item(s) to character inventory
 * @param inventoryRepo - Inventory repository
 * @param characterId - Character ID
 * @param item - Item template
 * @param quantity - Quantity to add (for equipment, this should be 1)
 * @returns Created or updated inventory entry
 */
export async function addItemToInventory(
  inventoryRepo: Repository<Inventory>,
  characterId: number,
  item: Item,
  quantity: number = 1,
): Promise<Inventory> {
  const isEquipment = item.item_type === ItemType.EQUIPMENT;

  // Equipment: Always create new entry with random stats
  if (isEquipment) {
    if (quantity > 1) {
      throw new Error('Equipment cannot be added with quantity > 1');
    }

    const specificStats = generateEquipmentStats(item);

    const newInventory = inventoryRepo.create({
      character_id: characterId,
      item_id: item.id,
      quantity: 1,
      specific_stats: specificStats || undefined, // Random stats for this equipment instance
    });

    return await inventoryRepo.save(newInventory);
  }

  // Materials/Consumables: Stack if exists, otherwise create new
  const existingInventory = await inventoryRepo.findOne({
    where: {
      character_id: characterId,
      item_id: item.id,
    },
  });

  if (existingInventory) {
    // Stack: Add to existing quantity
    existingInventory.quantity += quantity;
    return await inventoryRepo.save(existingInventory);
  } else {
    // Create new entry
    const newInventory = inventoryRepo.create({
      character_id: characterId,
      item_id: item.id,
      quantity,
      specific_stats: undefined, // Materials don't have specific stats
    });

    return await inventoryRepo.save(newInventory);
  }
}

/**
 * Add multiple items to inventory (for quest rewards, etc.)
 */
export async function addItemsToInventory(
  inventoryRepo: Repository<Inventory>,
  characterId: number,
  items: Array<{ item: Item; quantity: number }>,
): Promise<Inventory[]> {
  const results: Inventory[] = [];

  for (const { item, quantity } of items) {
    const result = await addItemToInventory(
      inventoryRepo,
      characterId,
      item,
      quantity,
    );
    results.push(result);
  }

  return results;
}

