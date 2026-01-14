import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * Get item by ID
   */
  @Get(':id')
  async getItemById(@Param('id') id: string) {
    return this.itemsService.getItemById(+id);
  }

  /**
   * Get item effects
   */
  @Get(':id/effects')
  async getItemEffects(@Param('id') id: string) {
    return this.itemsService.getItemEffects(+id);
  }

  /**
   * Use a consumable item
   */
  @Post('use')
  async useItem(
    @Body() body: { inventoryId: number; quantity?: number },
    @Request() req: any,
  ) {
    const characterId = req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.itemsService.useItem(characterId, body.inventoryId, body.quantity || 1);
  }
}

