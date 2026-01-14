import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment, EquipmentSlot } from '../entities/equipment.entity';
import { AncientArtifact } from '../entities/ancient-artifact.entity';
import { Inventory } from '../entities/inventory.entity';
import { Item, ItemType } from '../entities/item.entity';
import { Character } from '../entities/character.entity';

export interface EquipmentStats {
  strength: number;
  agility: number;
  wisdom: number;
  hp: number;
  defense: number;
}

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(AncientArtifact)
    private ancientArtifactRepository: Repository<AncientArtifact>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  /**
   * Get character's equipped items
   */
  async getCharacterEquipment(characterId: number): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      where: { character_id: characterId },
      relations: ['item'],
    });
  }

  /**
   * Get equipment by slot
   */
  async getEquipmentBySlot(characterId: number, slot: EquipmentSlot): Promise<Equipment | null> {
    return this.equipmentRepository.findOne({
      where: { character_id: characterId, slot },
      relations: ['item'],
    });
  }

  /**
   * Equip an item from inventory
   */
  async equipItem(
    characterId: number,
    inventoryId: number,
    slot: EquipmentSlot,
  ): Promise<{ success: boolean; message: string; equipment?: Equipment; unequipped?: Equipment }> {
    // Get inventory item
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId, character_id: characterId },
      relations: ['item'],
    });

    if (!inventory) {
      return { success: false, message: 'Inventory item not found' };
    }

    const item = inventory.item;

    // Check if item is equipment
    if (item.item_type !== ItemType.EQUIPMENT) {
      return { success: false, message: 'Item is not equipment' };
    }

    // Check if item has equipment_slot matching the requested slot
    // Support multiple slots for same type (e.g., weapon_1, weapon_2)
    if (item.equipment_slot) {
      const itemSlotParts = item.equipment_slot.split('_');
      const requestedSlotParts = slot.split('_');
      
      // If item has specific slot (e.g., 'weapon_1'), must match exactly
      if (itemSlotParts.length > 1) {
        if (item.equipment_slot !== slot) {
          return { success: false, message: `Item can only be equipped in ${item.equipment_slot}, not ${slot}` };
        }
      } else {
        // If item has generic slot (e.g., 'weapon'), check if requested slot matches type
        const itemSlotType = itemSlotParts[0]; // 'weapon', 'ring', etc.
        const requestedSlotType = requestedSlotParts[0];
        
        if (itemSlotType !== requestedSlotType) {
          return { success: false, message: `Item slot type mismatch. Expected: ${itemSlotType}, got: ${requestedSlotType}` };
        }
      }
    }
    
    // Check character level requirement
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return { success: false, message: 'Character not found' };
    }

    // Check artifact slot availability (mở từ Nguyên Anh - level 31+)
    if (slot.startsWith('artifact_')) {
      const artifactNumber = parseInt(slot.split('_')[1]);
      const requiredLevel = 31 + (artifactNumber - 1); // Artifact 1 = level 31, Artifact 2 = level 32, ...
      
      if (character.realm_level < requiredLevel) {
        return { success: false, message: `Artifact slot ${artifactNumber} requires realm level ${requiredLevel} (Nguyên Anh Tầng ${artifactNumber})` };
      }
    }

    if (item.required_level && character.realm_level < item.required_level) {
      return { success: false, message: `Character level too low. Required: ${item.required_level}` };
    }

    // Check if slot is already occupied
    const existingEquipment = await this.equipmentRepository.findOne({
      where: { character_id: characterId, slot },
    });

    let unequipped: Equipment | undefined;

    // If slot is occupied, unequip the existing item first
    if (existingEquipment) {
      // Move existing equipment back to inventory
      const existingInventory = await this.inventoryRepository.findOne({
        where: { character_id: characterId, item_id: existingEquipment.item_id },
      });

      if (!existingInventory) {
        // Create new inventory entry for unequipped item
        await this.inventoryRepository.save(
          this.inventoryRepository.create({
            character_id: characterId,
            item_id: existingEquipment.item_id,
            quantity: 1,
            specific_stats: existingEquipment.additional_stats || undefined,
          }),
        );
      } else {
        // Stack if same item (shouldn't happen for equipment, but handle it)
        existingInventory.quantity += 1;
        await this.inventoryRepository.save(existingInventory);
      }

      unequipped = existingEquipment;
      await this.equipmentRepository.remove(existingEquipment);
    }

    // Get stats from inventory's specific_stats or item's base stats
    const stats = inventory.specific_stats || item.equipment_stats || {};

    // Create equipment entry
    const equipment = this.equipmentRepository.create({
      character_id: characterId,
      item_id: item.id,
      slot,
      additional_stats: {
        strength: stats.strength || 0,
        agility: stats.agility || 0,
        wisdom: stats.wisdom || 0,
        hp: stats.hp || 0,
        defense: stats.defense || 0,
      },
      enhance_level: stats.enhancement_level || 0,
    });

    const saved = await this.equipmentRepository.save(equipment);

    // Remove item from inventory (equipment quantity is always 1)
    await this.inventoryRepository.remove(inventory);

    return {
      success: true,
      message: 'Item equipped successfully',
      equipment: saved,
      unequipped,
    };
  }

  /**
   * Unequip an item
   */
  async unequipItem(
    characterId: number,
    slot: EquipmentSlot,
  ): Promise<{ success: boolean; message: string; inventory?: Inventory }> {
    const equipment = await this.equipmentRepository.findOne({
      where: { character_id: characterId, slot },
      relations: ['item'],
    });

    if (!equipment) {
      return { success: false, message: 'No equipment in this slot' };
    }

    // Create inventory entry with stats
    const inventory = this.inventoryRepository.create({
      character_id: characterId,
      item_id: equipment.item_id,
      quantity: 1,
      specific_stats: {
        strength: equipment.additional_stats?.strength || 0,
        agility: equipment.additional_stats?.agility || 0,
        wisdom: equipment.additional_stats?.wisdom || 0,
        hp: equipment.additional_stats?.hp || 0,
        defense: equipment.additional_stats?.defense || 0,
        enhancement_level: equipment.enhance_level,
      },
    });

    const saved = await this.inventoryRepository.save(inventory);

    // Remove equipment
    await this.equipmentRepository.remove(equipment);

    return {
      success: true,
      message: 'Item unequipped successfully',
      inventory: saved,
    };
  }

  /**
   * Calculate total stats from all equipped items (including Ancient Artifacts)
   */
  async getTotalEquipmentStats(characterId: number): Promise<EquipmentStats> {
    const equipment = await this.equipmentRepository.find({
      where: { character_id: characterId },
    });

    const stats: EquipmentStats = {
      strength: 0,
      agility: 0,
      wisdom: 0,
      hp: 0,
      defense: 0,
    };

    // Add stats from regular equipment
    for (const eq of equipment) {
      if (eq.additional_stats) {
        stats.strength += eq.additional_stats.strength || 0;
        stats.agility += eq.additional_stats.agility || 0;
        stats.wisdom += eq.additional_stats.wisdom || 0;
        stats.hp += eq.additional_stats.hp || 0;
        stats.defense += eq.additional_stats.defense || 0;
      }
    }

    // Add stats from Ancient Artifacts (Cổ Bảo) - cộng dồn tất cả
    const artifacts = await this.ancientArtifactRepository.find({
      where: { character_id: characterId },
    });

    for (const artifact of artifacts) {
      if (artifact.stats) {
        stats.strength += artifact.stats.strength || 0;
        stats.agility += artifact.stats.agility || 0;
        stats.wisdom += artifact.stats.wisdom || 0;
        stats.hp += artifact.stats.hp || 0;
        stats.defense += artifact.stats.defense || 0;
      }
    }

    return stats;
  }

  /**
   * Get character's total stats (base + equipment)
   */
  async getCharacterTotalStats(characterId: number): Promise<EquipmentStats & { base: EquipmentStats }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const baseStats: EquipmentStats = {
      strength: character.strength,
      agility: character.agility,
      wisdom: character.wisdom,
      hp: 0, // HP is not stored in character, calculated from stats
      defense: 0, // Defense is not stored in character, calculated from stats
    };

    const equipmentStats = await this.getTotalEquipmentStats(characterId);

    return {
      base: baseStats,
      strength: baseStats.strength + equipmentStats.strength,
      agility: baseStats.agility + equipmentStats.agility,
      wisdom: baseStats.wisdom + equipmentStats.wisdom,
      hp: baseStats.hp + equipmentStats.hp,
      defense: baseStats.defense + equipmentStats.defense,
    };
  }

  // ========== Ancient Artifact (Cổ Bảo) Methods ==========

  /**
   * Get all Ancient Artifacts for a character
   */
  async getCharacterArtifacts(characterId: number): Promise<AncientArtifact[]> {
    return this.ancientArtifactRepository.find({
      where: { character_id: characterId },
      relations: ['item'],
    });
  }

  /**
   * Equip an Ancient Artifact (Cổ Bảo) - không giới hạn số lượng
   */
  async equipAncientArtifact(
    characterId: number,
    inventoryId: number,
  ): Promise<{ success: boolean; message: string; artifact?: AncientArtifact }> {
    // Get inventory item
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId, character_id: characterId },
      relations: ['item'],
    });

    if (!inventory) {
      return { success: false, message: 'Inventory item not found' };
    }

    const item = inventory.item;

    // Check if item is Ancient Artifact (cổ bảo)
    // Có thể check bằng category hoặc item_type
    if (item.category !== 'ancient_artifact' && item.item_type !== ItemType.SPECIAL) {
      return { success: false, message: 'Item is not an Ancient Artifact (Cổ Bảo)' };
    }

    // Get stats, effects, and penalties from inventory's specific_stats or item's base stats
    const stats = inventory.specific_stats || item.equipment_stats || {};
    const effects = (inventory.specific_stats?.effects || item.artifact_effects || {}) as any;
    const penalties = (inventory.specific_stats?.penalties || item.artifact_penalties || {}) as any;

    // Create artifact entry
    const artifact = this.ancientArtifactRepository.create({
      character_id: characterId,
      item_id: item.id,
      stats: {
        strength: stats.strength || 0,
        agility: stats.agility || 0,
        wisdom: stats.wisdom || 0,
        hp: stats.hp || 0,
        defense: stats.defense || 0,
      },
      effects: effects || null,
      penalties: penalties || null,
      enhance_level: stats.enhancement_level || 0,
    });

    const saved = await this.ancientArtifactRepository.save(artifact);

    // Remove item from inventory
    await this.inventoryRepository.remove(inventory);

    return {
      success: true,
      message: 'Ancient Artifact equipped successfully',
      artifact: saved,
    };
  }

  /**
   * Unequip an Ancient Artifact
   */
  async unequipAncientArtifact(
    characterId: number,
    artifactId: number,
  ): Promise<{ success: boolean; message: string; inventory?: Inventory }> {
    const artifact = await this.ancientArtifactRepository.findOne({
      where: { id: artifactId, character_id: characterId },
      relations: ['item'],
    });

    if (!artifact) {
      return { success: false, message: 'Ancient Artifact not found' };
    }

    // Create inventory entry with stats, effects, and penalties
    const inventory = this.inventoryRepository.create({
      character_id: characterId,
      item_id: artifact.item_id,
      quantity: 1,
      specific_stats: {
        ...(artifact.stats || {}),
        effects: artifact.effects || null,
        penalties: artifact.penalties || null,
      } as any,
    });

    const saved = await this.inventoryRepository.save(inventory);

    // Remove artifact
    await this.ancientArtifactRepository.remove(artifact);

    return {
      success: true,
      message: 'Ancient Artifact unequipped successfully',
      inventory: saved as Inventory,
    };
  }

  /**
   * Get available artifact slots count based on realm level
   * Nguyên Anh (level 31) mở slot 1, mỗi cấp mở thêm 1 slot
   */
  getAvailableArtifactSlots(realmLevel: number): number {
    if (realmLevel < 31) {
      return 0; // Chưa đến Nguyên Anh
    }
    // Level 31 = slot 1, level 32 = slot 2, ..., level 40 = slot 10
    return Math.min(10, realmLevel - 30);
  }

  /**
   * Get available artifact slots info for a character
   */
  async getAvailableArtifactSlotsInfo(characterId: number): Promise<{
    availableSlots: number;
    realmLevel: number;
    maxSlots: number;
  }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return { availableSlots: 0, realmLevel: 0, maxSlots: 10 };
    }

    return {
      availableSlots: this.getAvailableArtifactSlots(character.realm_level),
      realmLevel: character.realm_level,
      maxSlots: 10,
    };
  }
}

