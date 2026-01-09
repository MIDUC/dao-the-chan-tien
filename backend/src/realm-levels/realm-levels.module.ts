import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealmLevelsController } from './realm-levels.controller';
import { RealmLevelsService } from './realm-levels.service';
import { RealmLevel } from '../entities/realm-level.entity';
import { Character } from '../entities/character.entity';
import { CharacterProgression } from '../entities/character-progression.entity';
import { Currency } from '../entities/currency.entity';
import { Inventory } from '../entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RealmLevel,
      Character,
      CharacterProgression,
      Currency,
      Inventory,
    ]),
  ],
  controllers: [RealmLevelsController],
  providers: [RealmLevelsService],
  exports: [RealmLevelsService],
})
export class RealmLevelsModule {}

