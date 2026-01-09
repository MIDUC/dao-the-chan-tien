import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { Currency } from '../entities/currency.entity';
import { Character } from '../entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Currency, Character])],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}

