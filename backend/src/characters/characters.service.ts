import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../entities/character.entity';
import { Inventory } from '../entities/inventory.entity';
import { OfflineCultivationService } from '../offline-cultivation/offline-cultivation.service';
import { CurrencyService } from '../currency/currency.service';
import { CurrencyType } from '../entities/currency.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @Inject(forwardRef(() => OfflineCultivationService))
    private offlineCultivationService: OfflineCultivationService,
    private currencyService: CurrencyService,
  ) {}

  async findAll(): Promise<Character[]> {
    return this.characterRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number, processCultivation: boolean = true): Promise<Character | null> {
    const character = await this.characterRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!character) {
      return null;
    }

    // Set last_login_at if null (for characters created before this feature)
    if (!character.last_login_at) {
      character.last_login_at = new Date();
      await this.characterRepository.save(character);
    }

    // Process passive cultivation before returning character
    if (processCultivation) {
      await this.offlineCultivationService.processPassiveCultivation(id);
      // Fetch again to get updated EXP
      return this.characterRepository.findOne({
        where: { id },
        relations: ['user'],
      });
    }
    
    return character;
  }

  async findByUserId(userId: number): Promise<Character[]> {
    return this.characterRepository.find({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  /**
   * Get only EXP and realm_level for lightweight updates
   * This avoids loading full character data
   */
  async getExpOnly(id: number): Promise<{ exp: number; realm_level: number } | null> {
    const character = await this.characterRepository.findOne({
      where: { id },
      select: ['id', 'exp', 'realm_level', 'last_login_at'], // Include last_login_at
    });

    if (!character) {
      return null;
    }

    // Set last_login_at if null
    if (!character.last_login_at) {
      character.last_login_at = new Date();
      await this.characterRepository.save(character);
    }

    // Process passive cultivation first to ensure EXP is up to date
    await this.offlineCultivationService.processPassiveCultivation(id);
    
    // Fetch again to get updated EXP
    const updatedCharacter = await this.characterRepository.findOne({
      where: { id },
      select: ['id', 'exp', 'realm_level'],
    });

    if (!updatedCharacter) {
      return null;
    }

    return {
      exp: updatedCharacter.exp,
      realm_level: updatedCharacter.realm_level,
    };
  }

  /**
   * Get inventory items for a character
   */
  async getInventory(characterId: number): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { character_id: characterId },
      relations: ['item'],
      order: { slot_position: 'ASC', id: 'ASC' },
    });
  }

  /**
   * Expand inventory slots by purchasing with Immortal Jade
   * @param characterId - Character ID
   * @param slotsToAdd - Number of slots to add (default: 5)
   * @returns Updated character with new max_inventory_slots
   */
  async expandInventorySlots(
    characterId: number,
    slotsToAdd: number = 5,
  ): Promise<{ success: boolean; character: Character | null; message: string }> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return {
        success: false,
        character: null,
        message: 'Character not found',
      };
    }

    // Calculate cost: 10 Immortal Jade per slot
    const costPerSlot = 10;
    const totalCost = slotsToAdd * costPerSlot;

    // Check if character has enough Immortal Jade
    const hasEnough = await this.currencyService.hasEnoughCurrency(
      characterId,
      CurrencyType.IMMORTAL_JADE,
      totalCost,
    );

    if (!hasEnough) {
      return {
        success: false,
        character: null,
        message: `Không đủ Tiên Ngọc. Cần ${totalCost} Tiên Ngọc để mở thêm ${slotsToAdd} ô.`,
      };
    }

    // Deduct currency
    const deductResult = await this.currencyService.deductCurrency(
      characterId,
      CurrencyType.IMMORTAL_JADE,
      totalCost,
    );

    if (!deductResult.success) {
      return {
        success: false,
        character: null,
        message: 'Không thể trừ Tiên Ngọc',
      };
    }

    // Add inventory slots
    character.max_inventory_slots = (character.max_inventory_slots || 20) + slotsToAdd;
    const updatedCharacter = await this.characterRepository.save(character);

    return {
      success: true,
      character: updatedCharacter,
      message: `Đã mở thêm ${slotsToAdd} ô trang bị thành công!`,
    };
  }
}

