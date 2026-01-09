import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { Shop } from '../entities/shop.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { Item } from '../entities/item.entity';
import { Transaction } from '../entities/transaction.entity';
import { Character } from '../entities/character.entity';
import { Inventory } from '../entities/inventory.entity';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, ShopItem, Item, Transaction, Character, Inventory]),
    CurrencyModule,
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}

