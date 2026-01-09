import { Controller, Get, Param } from '@nestjs/common';
import { NpcsService } from './npcs.service';

@Controller('npcs')
export class NpcsController {
  constructor(private readonly npcsService: NpcsService) {}

  @Get()
  async findAll() {
    return this.npcsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.npcsService.findOne(+id);
  }

  @Get(':id/quests')
  async getQuests(@Param('id') id: string) {
    return this.npcsService.getAvailableQuests(+id);
  }
}

