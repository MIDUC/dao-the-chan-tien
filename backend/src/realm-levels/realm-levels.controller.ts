import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { RealmLevelsService } from './realm-levels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('realm-levels')
@UseGuards(JwtAuthGuard)
export class RealmLevelsController {
  constructor(private readonly realmLevelsService: RealmLevelsService) {}

  /**
   * Get all realm levels
   */
  @Get()
  async getAllRealmLevels() {
    return this.realmLevelsService.getAllRealmLevels();
  }

  /**
   * Get realm level by level number
   */
  @Get(':level')
  async getRealmLevel(@Param('level') level: string) {
    return this.realmLevelsService.getRealmLevel(+level);
  }

  /**
   * Get next realm level and check requirements for current character
   */
  @Get('character/:characterId/next')
  async getNextRealmLevel(@Param('characterId') characterId: string) {
    return this.realmLevelsService.checkBreakthroughRequirements(+characterId);
  }

  /**
   * Perform breakthrough to next level
   */
  @Post('character/:characterId/breakthrough')
  async breakthrough(@Param('characterId') characterId: string) {
    return this.realmLevelsService.breakthrough(+characterId);
  }
}

