import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyType } from '../entities/currency.entity';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('character/:characterId')
  async getCharacterCurrencies(@Param('characterId') characterId: string) {
    return this.currencyService.getCharacterCurrencies(+characterId);
  }

  @Get('character/:characterId/:type')
  async getCharacterCurrency(
    @Param('characterId') characterId: string,
    @Param('type') type: CurrencyType,
  ) {
    return this.currencyService.getCharacterCurrency(+characterId, type);
  }

  @Post('add')
  async addCurrency(
    @Body() body: { characterId: number; currencyType: CurrencyType; amount: number },
  ) {
    return this.currencyService.addCurrency(body.characterId, body.currencyType, body.amount);
  }

  @Post('deduct')
  async deductCurrency(
    @Body() body: { characterId: number; currencyType: CurrencyType; amount: number },
  ) {
    return this.currencyService.deductCurrency(body.characterId, body.currencyType, body.amount);
  }

  @Post('initialize/:characterId')
  async initializeCurrencies(@Param('characterId') characterId: string) {
    return this.currencyService.initializeCharacterCurrencies(+characterId);
  }
}

