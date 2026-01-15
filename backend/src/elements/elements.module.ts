import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementsController } from './elements.controller';
import { ElementsService } from './elements.service';
import { CharacterElement } from '../entities/character-element.entity';
import { Character } from '../entities/character.entity';
import { Item } from '../entities/item.entity';
import { Inventory } from '../entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterElement, Character, Item, Inventory])],
  controllers: [ElementsController],
  providers: [ElementsService],
  exports: [ElementsService],
})
export class ElementsModule {}

