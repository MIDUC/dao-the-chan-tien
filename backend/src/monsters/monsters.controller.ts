import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { MonstersService } from './monsters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Monster, MonsterType, MonsterRarity } from '../entities/monster.entity';

@Controller('monsters')
@UseGuards(JwtAuthGuard)
export class MonstersController {
  constructor(private readonly monstersService: MonstersService) {}

  @Get()
  async findAll() {
    return this.monstersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.monstersService.findOne(+id);
  }

  @Get('level/:minLevel/:maxLevel')
  async findByLevelRange(
    @Param('minLevel') minLevel: string,
    @Param('maxLevel') maxLevel: string,
  ) {
    return this.monstersService.findByLevelRange(+minLevel, +maxLevel);
  }

  @Get('type/:type')
  async findByType(@Param('type') type: MonsterType) {
    return this.monstersService.findByType(type);
  }

  @Get('rarity/:rarity')
  async findByRarity(@Param('rarity') rarity: MonsterRarity) {
    return this.monstersService.findByRarity(rarity);
  }

  @Get(':id/stats')
  async getCombatStats(
    @Param('id') id: string,
    @Body() body: { level?: number },
  ) {
    const monster = await this.monstersService.findOne(+id);
    return this.monstersService.calculateCombatStats(monster, body.level);
  }

  @Get(':id/skills')
  async getMonsterSkills(@Param('id') id: string) {
    return this.monstersService.getMonsterSkills(+id);
  }

  // Admin routes
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() monsterData: Partial<Monster>) {
    return this.monstersService.create(monsterData);
  }

  @Post(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() monsterData: Partial<Monster>) {
    return this.monstersService.update(+id, monsterData);
  }
}

