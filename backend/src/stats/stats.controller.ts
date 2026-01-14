import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * Get complete character stats
   */
  @Get('character/:characterId')
  async getCharacterStats(@Param('characterId') characterId: string) {
    return this.statsService.getCharacterStats(+characterId);
  }

  /**
   * Get primary stats
   */
  @Get('character/:characterId/primary')
  async getPrimaryStats(@Param('characterId') characterId: string) {
    return this.statsService.getPrimaryStats(+characterId);
  }

  /**
   * Get hidden stats
   */
  @Get('character/:characterId/hidden')
  async getHiddenStats(@Param('characterId') characterId: string) {
    return this.statsService.getHiddenStats(+characterId);
  }

  /**
   * Get combat stats (calculated)
   */
  @Get('character/:characterId/combat')
  async getCombatStats(@Param('characterId') characterId: string) {
    return this.statsService.calculateCombatStats(+characterId);
  }

  /**
   * Check for Qi Deviation (Tẩu Hỏa Nhập Ma)
   */
  @Get('character/:characterId/qi-deviation')
  async checkQiDeviation(@Param('characterId') characterId: string) {
    return this.statsService.checkQiDeviation(+characterId);
  }

  /**
   * Add primary stat (from fitness activities)
   */
  @Post('add-primary-stat')
  async addPrimaryStat(
    @Body() body: { characterId: number; statName: string; amount: number },
    @Request() req: any,
  ) {
    const characterId = body.characterId || req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }

    const validStats = ['luc_dao', 'can_cot', 'than_phap', 'ngo_tinh', 'dinh_luc'];
    if (!validStats.includes(body.statName)) {
      return { success: false, message: 'Invalid stat name' };
    }

    return this.statsService.addPrimaryStat(
      characterId,
      body.statName as any,
      body.amount,
    );
  }
}

