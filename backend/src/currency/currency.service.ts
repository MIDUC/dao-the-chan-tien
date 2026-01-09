import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency, CurrencyType } from '../entities/currency.entity';
import { Character } from '../entities/character.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  /**
   * Get all currencies for a character
   */
  async getCharacterCurrencies(characterId: number): Promise<Currency[]> {
    return this.currencyRepository.find({
      where: { character_id: characterId },
    });
  }

  /**
   * Get specific currency for a character
   */
  async getCharacterCurrency(
    characterId: number,
    currencyType: CurrencyType,
  ): Promise<Currency | null> {
    return this.currencyRepository.findOne({
      where: { character_id: characterId, currency_type: currencyType },
    });
  }

  /**
   * Add currency to character (create if not exists)
   */
  async addCurrency(
    characterId: number,
    currencyType: CurrencyType,
    amount: number,
  ): Promise<Currency> {
    let currency = await this.getCharacterCurrency(characterId, currencyType);

    if (!currency) {
      currency = this.currencyRepository.create({
        character_id: characterId,
        currency_type: currencyType,
        amount: 0,
      });
    }

    currency.amount += amount;
    return this.currencyRepository.save(currency);
  }

  /**
   * Deduct currency from character
   */
  async deductCurrency(
    characterId: number,
    currencyType: CurrencyType,
    amount: number,
  ): Promise<{ success: boolean; currency: Currency | null }> {
    const currency = await this.getCharacterCurrency(characterId, currencyType);

    if (!currency || currency.amount < amount) {
      return { success: false, currency: null };
    }

    currency.amount -= amount;
    const updated = await this.currencyRepository.save(currency);
    return { success: true, currency: updated };
  }

  /**
   * Check if character has enough currency
   */
  async hasEnoughCurrency(
    characterId: number,
    currencyType: CurrencyType,
    amount: number,
  ): Promise<boolean> {
    const currency = await this.getCharacterCurrency(characterId, currencyType);
    return currency ? currency.amount >= amount : false;
  }

  /**
   * Initialize currencies for a character (all types with 0)
   */
  async initializeCharacterCurrencies(characterId: number): Promise<Currency[]> {
    const currencies: Currency[] = [];

    for (const type of Object.values(CurrencyType)) {
      const existing = await this.getCharacterCurrency(characterId, type);
      if (!existing) {
        const currency = this.currencyRepository.create({
          character_id: characterId,
          currency_type: type,
          amount: 0,
        });
        currencies.push(await this.currencyRepository.save(currency));
      }
    }

    return currencies;
  }
}

