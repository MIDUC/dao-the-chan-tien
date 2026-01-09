import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('characters')
@UseGuards(JwtAuthGuard)
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  async findAll() {
    return this.charactersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.charactersService.findOne(+id);
  }

  @Get(':id/exp')
  async getExp(@Param('id') id: string) {
    return this.charactersService.getExpOnly(+id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.charactersService.findByUserId(+userId);
  }

  @Get(':id/inventory')
  async getInventory(@Param('id') id: string) {
    return this.charactersService.getInventory(+id);
  }

  @Post(':id/inventory/expand')
  async expandInventory(
    @Param('id') id: string,
    @Body() body: { slotsToAdd?: number },
  ) {
    const slotsToAdd = body.slotsToAdd || 5;
    return this.charactersService.expandInventorySlots(+id, slotsToAdd);
  }
}

