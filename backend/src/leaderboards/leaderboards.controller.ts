import { Controller, Get, Param, Query } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardType, LeaderboardPeriod } from '../entities/leaderboard.entity';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get()
  async getLeaderboard(
    @Query('type') type: LeaderboardType,
    @Query('period') period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
    @Query('limit') limit: string = '100',
  ) {
    return this.leaderboardsService.getLeaderboard(type, period, +limit);
  }

  @Get('character/:characterId/rank')
  async getCharacterRank(
    @Param('characterId') characterId: string,
    @Query('type') type: LeaderboardType,
    @Query('period') period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
  ) {
    return this.leaderboardsService.getCharacterRank(+characterId, type, period);
  }
}

