import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ElementsService } from './elements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ElementType } from '../entities/character-element.entity';

@Controller('elements')
export class ElementsController {
  constructor(private readonly elementsService: ElementsService) {}

  /**
   * Get character's elements
   */
  @Get('character/:characterId')
  @UseGuards(JwtAuthGuard)
  async getCharacterElements(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Request() req,
  ) {
    const userCharacterId = req.user.character?.id;
    if (userCharacterId && userCharacterId !== characterId) {
      throw new UnauthorizedException('Character does not belong to user');
    }
    return this.elementsService.getCharacterElements(characterId);
  }

  /**
   * Use element item from inventory to upgrade element
   */
  @Post('character/:characterId/use-item')
  @UseGuards(JwtAuthGuard)
  async useElementItem(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Body() body: { elementType: ElementType; inventoryId: number },
    @Request() req,
  ) {
    const userCharacterId = req.user.character?.id;
    if (userCharacterId && userCharacterId !== characterId) {
      throw new UnauthorizedException('Character does not belong to user');
    }
    return this.elementsService.useElementItem(
      characterId,
      body.elementType,
      body.inventoryId,
    );
  }

  /**
   * Get element items from character inventory
   */
  @Get('character/:characterId/items')
  @UseGuards(JwtAuthGuard)
  async getElementItems(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Request() req,
  ) {
    const userCharacterId = req.user.character?.id;
    if (userCharacterId && userCharacterId !== characterId) {
      throw new UnauthorizedException('Character does not belong to user');
    }
    return this.elementsService.getElementItems(characterId);
  }
}

