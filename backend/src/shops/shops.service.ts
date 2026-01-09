import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../entities/shop.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { Item, ItemType } from '../entities/item.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { Character } from '../entities/character.entity';
import { Inventory } from '../entities/inventory.entity';
import { CurrencyService } from '../currency/currency.service';
import { CurrencyType } from '../entities/currency.entity';
import { addItemToInventory } from '../utils/inventory.util';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(ShopItem)
    private shopItemRepository: Repository<ShopItem>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private currencyService: CurrencyService,
  ) {}

  /**
   * Get all shops
   */
  async findAll(): Promise<Shop[]> {
    return this.shopRepository.find({
      where: { is_active: true },
      relations: ['items'],
    });
  }

  /**
   * Get shop by ID
   */
  async findOne(id: number): Promise<Shop | null> {
    return this.shopRepository.findOne({
      where: { id, is_active: true },
      relations: ['items', 'items.item'],
    });
  }

  /**
   * Get shop items
   */
  async getShopItems(shopId: number): Promise<ShopItem[]> {
    return this.shopItemRepository.find({
      where: { shop_id: shopId, is_active: true },
      relations: ['item'],
    });
  }

  /**
   * Buy item from shop
   */
  async buyItem(
    characterId: number,
    shopItemId: number,
    quantity: number = 1,
  ): Promise<{ success: boolean; message: string; transaction?: Transaction }> {
    const shopItem = await this.shopItemRepository.findOne({
      where: { id: shopItemId, is_active: true },
      relations: ['shop', 'item'],
    });

    if (!shopItem) {
      return { success: false, message: 'Shop item not found' };
    }

    // Check stock
    if (shopItem.stock !== null && shopItem.stock < quantity) {
      return { success: false, message: 'Not enough stock' };
    }

    // Check daily limit (TODO: implement daily tracking)

    // Check currency
    const totalPrice = shopItem.price * quantity;
    const currencyType = shopItem.currency_type as CurrencyType;
    const hasEnough = await this.currencyService.hasEnoughCurrency(
      characterId,
      currencyType,
      totalPrice,
    );

    if (!hasEnough) {
      return { success: false, message: 'Not enough currency' };
    }

    // Deduct currency
    const deductResult = await this.currencyService.deductCurrency(
      characterId,
      currencyType,
      totalPrice,
    );

    if (!deductResult.success) {
      return { success: false, message: 'Failed to deduct currency' };
    }

    // Check if item is equipment - equipment cannot stack (quantity must be 1)
    const isEquipment = shopItem.item.item_type === ItemType.EQUIPMENT;
    if (isEquipment && quantity > 1) {
      return { success: false, message: 'Vũ khí/trang bị không thể mua nhiều hơn 1' };
    }

    // Use utility function to add item to inventory
    // This handles both equipment (creates new with random stats) and materials (stacks)
    await addItemToInventory(
      this.inventoryRepository,
      characterId,
      shopItem.item,
      quantity,
    );

    // Update shop item stock
    if (shopItem.stock !== null) {
      shopItem.stock -= quantity;
      shopItem.sold_count += quantity;
      await this.shopItemRepository.save(shopItem);
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      character_id: characterId,
      transaction_type: TransactionType.BUY,
      item_id: shopItem.item_id,
      shop_id: shopItem.shop_id,
      quantity,
      amount: totalPrice,
      currency_type: currencyType,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    return {
      success: true,
      message: 'Item purchased successfully',
      transaction: savedTransaction,
    };
  }

  /**
   * Sell item to shop
   */
  async sellItem(
    characterId: number,
    itemId: number,
    quantity: number = 1,
  ): Promise<{ success: boolean; message: string; transaction?: Transaction }> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item || !item.sellable) {
      return { success: false, message: 'Item cannot be sold' };
    }

    // Check inventory
    const inventory = await this.inventoryRepository.findOne({
      where: { character_id: characterId, item_id: itemId },
    });

    if (!inventory || inventory.quantity < quantity) {
      return { success: false, message: 'Not enough items in inventory' };
    }

    // Remove from inventory
    inventory.quantity -= quantity;
    if (inventory.quantity === 0) {
      await this.inventoryRepository.remove(inventory);
    } else {
      await this.inventoryRepository.save(inventory);
    }

    // Add currency
    const totalPrice = item.sell_price * quantity;
    await this.currencyService.addCurrency(characterId, CurrencyType.LING_STONE, totalPrice);

    // Create transaction
    const transaction = this.transactionRepository.create({
      character_id: characterId,
      transaction_type: TransactionType.SELL,
      item_id: itemId,
      quantity,
      amount: totalPrice,
      currency_type: CurrencyType.LING_STONE,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    return {
      success: true,
      message: 'Item sold successfully',
      transaction: savedTransaction,
    };
  }

  /**
   * Get character transactions
   */
  async getCharacterTransactions(characterId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { character_id: characterId },
      relations: ['item', 'shop'],
      order: { created_at: 'DESC' },
      take: 50, // Last 50 transactions
    });
  }
}

