import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StatsCalculationService } from '../services/stats-calculation.service';
import { Request } from 'express';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(
    private readonly statsCalculationService: StatsCalculationService,
  ) {}

  /**
   * Refresh and get character stats
   * Call this after equipping/unequipping items, learning talents, etc.
   */
  @Post('character/:characterId/refresh')
  async refreshStats(@Param('characterId') characterId: number) {
    const finalStats = await this.statsCalculationService.refreshStats(
      characterId,
    );
    return {
      success: true,
      stats: finalStats,
    };
  }

  /**
   * Get current final stats (without recalculating)
   */
  @Get('character/:characterId')
  async getStats(@Param('characterId') characterId: number) {
    // This will recalculate if needed, or you can add a method to just fetch from DB
    const finalStats = await this.statsCalculationService.refreshStats(
      characterId,
    );
    return {
      stats: finalStats,
    };
  }

  /**
   * Get detailed calculation breakdown (for debugging/admin)
   */
  @Get('character/:characterId/details')
  async getCalculationDetails(@Param('characterId') characterId: number) {
    const details = await this.statsCalculationService.getCalculationDetails(
      characterId,
    );
    return {
      calculation: details,
    };
  }
}

