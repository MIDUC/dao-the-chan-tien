import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterElement, ElementType, ElementGrade } from '../entities/character-element.entity';
import { Character } from '../entities/character.entity';
import { Item, ItemType, ItemRarity } from '../entities/item.entity';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class ElementsService {
  constructor(
    @InjectRepository(CharacterElement)
    private elementRepository: Repository<CharacterElement>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  /**
   * Get character's elements
   */
  async getCharacterElements(characterId: number): Promise<CharacterElement[]> {
    return this.elementRepository.find({
      where: { character_id: characterId },
      order: { element_type: 'ASC' },
    });
  }

  /**
   * Get or create element for character
   */
  async getOrCreateElement(
    characterId: number,
    elementType: ElementType,
    grade: ElementGrade = ElementGrade.PHAM,
  ): Promise<CharacterElement> {
    let element = await this.elementRepository.findOne({
      where: { character_id: characterId, element_type: elementType },
    });

    if (!element) {
      const character = await this.characterRepository.findOne({
        where: { id: characterId },
      });
      if (!character) {
        throw new NotFoundException(`Character with ID ${characterId} not found`);
      }

      element = this.elementRepository.create({
        character_id: characterId,
        element_type: elementType,
        grade,
        level: 1,
        exp: 0,
      });
      element = await this.elementRepository.save(element);
    }

    return element;
  }

  /**
   * Add exp to element using item from inventory
   */
  async useElementItem(
    characterId: number,
    elementType: ElementType,
    inventoryId: number,
  ): Promise<{ element: CharacterElement; inventory: Inventory | null }> {
    // Get inventory item
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId, character_id: characterId },
      relations: ['item'],
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory item with ID ${inventoryId} not found`);
    }

    const item = inventory.item;

    // Check if item is material type
    if (item.item_type !== ItemType.MATERIAL) {
      throw new Error('Item is not a material');
    }

    // Parse element from item.element array or code/name
    const itemElement = this.parseElementFromItem(item, elementType);
    if (!itemElement || itemElement !== elementType) {
      throw new Error('Item element does not match requested element type');
    }

    // Calculate exp from rarity
    const expGiven = this.calculateExpFromRarity(item.rarity);

    const element = await this.getOrCreateElement(characterId, elementType);

    // Calculate exp needed for next level
    const expNeeded = this.calculateExpForLevel(element.level + 1);
    
    // Add exp
    element.exp += expGiven;

    // Level up if enough exp
    while (element.exp >= expNeeded && element.level < 100) {
      element.exp -= expNeeded;
      element.level += 1;
    }

    // Cap at level 100
    if (element.level >= 100) {
      element.exp = 0;
    }

    const savedElement = await this.elementRepository.save(element);

    // Remove item from inventory (consumable)
    inventory.quantity -= 1;
    let savedInventory: Inventory | null = null;
    if (inventory.quantity <= 0) {
      await this.inventoryRepository.remove(inventory);
    } else {
      savedInventory = await this.inventoryRepository.save(inventory);
    }

    return { element: savedElement, inventory: savedInventory };
  }

  /**
   * Parse element type from item
   * Maps item.element array to ElementType enum
   */
  private parseElementFromItem(item: Item, requestedType: ElementType): ElementType | null {
    const elementMap: Record<string, ElementType> = {
      kim: ElementType.KIM,
      moc: ElementType.MOC,
      thuy: ElementType.THUY,
      hoa: ElementType.HOA,
      tho: ElementType.THO,
      loi: ElementType.LOI,
      bang: ElementType.BANG,
      duong: ElementType.DUONG,
      am: ElementType.AM,
      // Map quang -> duong, phong -> loi (if needed)
      quang: ElementType.DUONG,
      phong: ElementType.LOI,
    };

    // First check item.element array
    if (item.element && Array.isArray(item.element)) {
      for (const elem of item.element) {
        const mappedElement = elementMap[elem];
        if (mappedElement === requestedType) {
          return requestedType;
        }
      }
    }

    // Fallback: parse from category or name
    const category = item.category || '';
    const name = item.name || '';
    const lowerCategory = category.toLowerCase();
    const lowerName = name.toLowerCase();

    // Check if category or name contains element keyword matching requested type
    const requestedKey = Object.entries(elementMap).find(
      ([_, value]) => value === requestedType
    )?.[0];

    if (requestedKey) {
      if (lowerCategory.includes(requestedKey) || lowerName.includes(requestedKey)) {
        return requestedType;
      }
    }

    return null;
  }

  /**
   * Calculate exp from item rarity
   */
  private calculateExpFromRarity(rarity: ItemRarity): number {
    const expMap: Record<ItemRarity, number> = {
      [ItemRarity.COMMON]: 100,
      [ItemRarity.UNCOMMON]: 500,
      [ItemRarity.RARE]: 1000,
      [ItemRarity.EPIC]: 2000,
      [ItemRarity.LEGENDARY]: 5000,
      [ItemRarity.MYTHIC]: 10000,
    };
    return expMap[rarity] || 100;
  }

  /**
   * Calculate exp needed for a level
   */
  private calculateExpForLevel(level: number): number {
    // Formula: base * level^1.5
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  /**
   * Get element value for damage calculation
   */
  async getElementValue(characterId: number, elementType: ElementType): Promise<number> {
    const element = await this.elementRepository.findOne({
      where: { character_id: characterId, element_type: elementType },
    });

    if (!element) {
      return 0;
    }

    // Base value = level * grade multiplier
    const gradeMultiplier: Record<ElementGrade, number> = {
      [ElementGrade.PHAM]: 1,
      [ElementGrade.TOT]: 1.2,
      [ElementGrade.HIEM]: 1.5,
      [ElementGrade.CUC_HIEM]: 2,
      [ElementGrade.HUYEN_THOAI]: 3,
      [ElementGrade.THAN_THOAI]: 5,
    };

    return element.level * gradeMultiplier[element.grade];
  }

  /**
   * Get element items from character inventory
   * Returns all material items - frontend will filter by element type
   */
  async getElementItems(characterId: number, elementType?: ElementType): Promise<Inventory[]> {
    const inventories = await this.inventoryRepository.find({
      where: { character_id: characterId },
      relations: ['item'],
    });

    console.log(`[ElementsService] Found ${inventories.length} items in inventory for character ${characterId}`);

    // Filter items that are materials
    const filtered = inventories.filter(inv => {
      const item = inv.item;
      console.log(`[ElementsService] Checking item: ${item.name}, type: ${item.item_type}, element:`, item.element);
      
      if (item.item_type !== ItemType.MATERIAL) {
        console.log(`[ElementsService] Item ${item.name} is not MATERIAL, skipping`);
        return false;
      }
      
      // Return all material items - let frontend filter by element
      console.log(`[ElementsService] Item ${item.name} is MATERIAL, including`);
      return true;
    });

    console.log(`[ElementsService] Filtered to ${filtered.length} material items`);
    return filtered;
  }
}

