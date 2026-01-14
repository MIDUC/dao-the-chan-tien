import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, ItemType } from '../entities/item.entity';
import { ItemEffect, EffectType } from '../entities/item-effect.entity';
import { Inventory } from '../entities/inventory.entity';
import { Character } from '../entities/character.entity';
import { CurrencyService } from '../currency/currency.service';
import { CurrencyType } from '../entities/currency.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(ItemEffect)
    private itemEffectRepository: Repository<ItemEffect>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private currencyService: CurrencyService,
  ) {}

  /**
   * Use a consumable item
   */
  async useItem(
    characterId: number,
    inventoryId: number,
    quantity: number = 1,
  ): Promise<{ success: boolean; message: string; effects?: any[] }> {
    // Get inventory item
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId, character_id: characterId },
      relations: ['item'],
    });

    if (!inventory) {
      return { success: false, message: 'Item not found in inventory' };
    }

    const item = inventory.item;

    // Check if item is usable
    if (!item.usable) {
      return { success: false, message: 'Item is not usable' };
    }

    // Check if item is consumable
    if (item.item_type !== ItemType.CONSUMABLE) {
      return { success: false, message: 'Item is not a consumable' };
    }

    // Check quantity
    if (inventory.quantity < quantity) {
      return { success: false, message: 'Not enough items' };
    }

    // Get character
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return { success: false, message: 'Character not found' };
    }

    // Get item effects
    const effects = await this.itemEffectRepository.find({
      where: { item_id: item.id },
    });

    if (effects.length === 0) {
      return { success: false, message: 'Item has no effects' };
    }

    const appliedEffects: any[] = [];

    // Apply effects
    for (const effect of effects) {
      const result = await this.applyEffect(character, effect, quantity);
      appliedEffects.push(result);
    }

    // Update character
    await this.characterRepository.save(character);

    // Remove item from inventory
    inventory.quantity -= quantity;
    if (inventory.quantity <= 0) {
      await this.inventoryRepository.remove(inventory);
    } else {
      await this.inventoryRepository.save(inventory);
    }

    return {
      success: true,
      message: 'Item used successfully',
      effects: appliedEffects,
    };
  }

  /**
   * Apply item effect to character
   */
  private async applyEffect(
    character: Character,
    effect: ItemEffect,
    quantity: number,
  ): Promise<{ type: string; value: any; message: string }> {
    const value = effect.effect_value;
    const amount = (value.amount || 0) * quantity;
    const percentage = value.percentage || 0;

    switch (effect.effect_type) {
      case EffectType.HEAL:
        // Heal HP (if HP is stored, otherwise it's calculated)
        // For now, we'll just return the heal amount
        return {
          type: 'heal',
          value: amount,
          message: `Healed ${amount} HP`,
        };

      case EffectType.EXP_BOOST:
        // Add EXP
        const expGain = amount + (character.exp * percentage) / 100;
        character.exp += Math.floor(expGain);
        return {
          type: 'exp_boost',
          value: Math.floor(expGain),
          message: `Gained ${Math.floor(expGain)} EXP`,
        };

      case EffectType.REALM_BOOST:
        // Add base_exp_per_interval (passive cultivation boost)
        const boostAmount = amount + (character.base_exp_per_interval * percentage) / 100;
        character.base_exp_per_interval += boostAmount;
        return {
          type: 'realm_boost',
          value: boostAmount,
          message: `Passive cultivation boosted by ${boostAmount.toFixed(2)} EXP/interval`,
        };

      case EffectType.STAT_INCREASE:
        // Permanently increase stat
        const statType = value.stat_type;
        if (statType === 'strength') {
          character.strength += amount;
          return {
            type: 'stat_increase',
            value: { stat: 'strength', amount },
            message: `Strength increased by ${amount}`,
          };
        } else if (statType === 'agility') {
          character.agility += amount;
          return {
            type: 'stat_increase',
            value: { stat: 'agility', amount },
            message: `Agility increased by ${amount}`,
          };
        } else if (statType === 'wisdom') {
          character.wisdom += amount;
          return {
            type: 'stat_increase',
            value: { stat: 'wisdom', amount },
            message: `Wisdom increased by ${amount}`,
          };
        }
        break;

      case EffectType.CURRENCY:
        // Add currency
        const currencyType = value.stat_type as CurrencyType;
        if (currencyType) {
          await this.currencyService.addCurrency(character.id, currencyType, amount);
          return {
            type: 'currency',
            value: { currency: currencyType, amount },
            message: `Gained ${amount} ${currencyType}`,
          };
        }
        break;

      case EffectType.BUFF:
        // Temporary buff (would need a buff system to track duration)
        // For now, just return the buff info
        return {
          type: 'buff',
          value: {
            stat_type: value.stat_type,
            amount,
            duration: value.duration || 0,
          },
          message: `Buff applied: ${value.stat_type} +${amount} for ${value.duration || 0}s`,
        };

      default:
        return {
          type: 'unknown',
          value: null,
          message: 'Unknown effect type',
        };
    }

    return {
      type: 'none',
      value: null,
      message: 'Effect not applied',
    };
  }

  /**
   * Get item by ID
   */
  async getItemById(id: number): Promise<Item | null> {
    return this.itemRepository.findOne({
      where: { id },
      relations: ['effects'],
    });
  }

  /**
   * Get item effects
   */
  async getItemEffects(itemId: number): Promise<ItemEffect[]> {
    return this.itemEffectRepository.find({
      where: { item_id: itemId },
    });
  }
}

