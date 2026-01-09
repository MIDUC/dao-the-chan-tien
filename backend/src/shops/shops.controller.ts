import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  async findAll() {
    return this.shopsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.shopsService.findOne(+id);
  }

  @Get(':id/items')
  async getShopItems(@Param('id') id: string) {
    return this.shopsService.getShopItems(+id);
  }

  @Post('buy')
  async buyItem(
    @Body() body: { characterId: number; shopItemId: number; quantity?: number },
  ) {
    return this.shopsService.buyItem(body.characterId, body.shopItemId, body.quantity || 1);
  }

  @Post('sell')
  async sellItem(
    @Body() body: { characterId: number; itemId: number; quantity?: number },
  ) {
    return this.shopsService.sellItem(body.characterId, body.itemId, body.quantity || 1);
  }

  @Get('transactions/character/:characterId')
  async getCharacterTransactions(@Param('characterId') characterId: string) {
    return this.shopsService.getCharacterTransactions(+characterId);
  }
}

