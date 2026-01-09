import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { Character } from '../entities/character.entity';
import { Inventory } from '../entities/inventory.entity';
import { OfflineCultivationModule } from '../offline-cultivation/offline-cultivation.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, Inventory]),
    forwardRef(() => OfflineCultivationModule),
    CurrencyModule,
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService],
})
export class CharactersModule {}

