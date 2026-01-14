import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from '../entities/item.entity';
import { ItemEffect } from '../entities/item-effect.entity';
import { Inventory } from '../entities/inventory.entity';
import { Character } from '../entities/character.entity';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, ItemEffect, Inventory, Character]),
    CurrencyModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}

