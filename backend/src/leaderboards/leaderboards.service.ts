import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard, LeaderboardType, LeaderboardPeriod } from '../entities/leaderboard.entity';
import { Character } from '../entities/character.entity';

@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    limit: number = 100,
  ): Promise<Leaderboard[]> {
    const query = this.leaderboardRepository
      .createQueryBuilder('leaderboard')
      .where('leaderboard.leaderboard_type = :type', { type })
      .andWhere('leaderboard.period = :period', { period })
      .orderBy('leaderboard.score', 'DESC')
      .addOrderBy('leaderboard.rank', 'ASC')
      .limit(limit);

    if (period !== LeaderboardPeriod.ALL_TIME) {
      const today = new Date().toISOString().split('T')[0];
      query.andWhere('leaderboard.period_date = :date', { date: today });
    }

    return query.getMany();
  }

  /**
   * Update leaderboard for a character
   */
  async updateCharacterLeaderboard(
    characterId: number,
    type: LeaderboardType,
  ): Promise<void> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return;
    }

    let score = 0;
    switch (type) {
      case LeaderboardType.REALM_LEVEL:
        score = character.realm_level;
        break;
      case LeaderboardType.EXP:
        score = character.exp;
        break;
      // TODO: Add other types (quest_completed, checkin_streak, etc.)
    }

    // Update for all periods
    const periods = [
      LeaderboardPeriod.DAILY,
      LeaderboardPeriod.WEEKLY,
      LeaderboardPeriod.MONTHLY,
      LeaderboardPeriod.ALL_TIME,
    ];

    for (const period of periods) {
      const today = new Date().toISOString().split('T')[0];
      const where: any = {
        character_id: characterId,
        leaderboard_type: type,
        period,
      };
      if (period !== LeaderboardPeriod.ALL_TIME) {
        where.period_date = today;
      }
      let leaderboard = await this.leaderboardRepository.findOne({
        where,
      });

      if (!leaderboard) {
        leaderboard = this.leaderboardRepository.create({
          character_id: characterId,
          leaderboard_type: type,
          period,
          score,
          rank: 0,
          ...(period !== LeaderboardPeriod.ALL_TIME ? { period_date: today } : {}),
        });
      } else {
        leaderboard.score = score;
      }

      await this.leaderboardRepository.save(leaderboard);
    }

    // Recalculate ranks
    await this.recalculateRanks(type, LeaderboardPeriod.ALL_TIME);
  }

  /**
   * Recalculate ranks for a leaderboard
   */
  private async recalculateRanks(type: LeaderboardType, period: LeaderboardPeriod): Promise<void> {
    const leaderboards = await this.getLeaderboard(type, period, 1000);
    for (let i = 0; i < leaderboards.length; i++) {
      leaderboards[i].rank = i + 1;
      await this.leaderboardRepository.save(leaderboards[i]);
    }
  }

  /**
   * Get character rank
   */
  async getCharacterRank(
    characterId: number,
    type: LeaderboardType,
    period: LeaderboardPeriod,
  ): Promise<{ rank: number; score: number } | null> {
    const where: any = {
      character_id: characterId,
      leaderboard_type: type,
      period,
    };
    if (period !== LeaderboardPeriod.ALL_TIME) {
      where.period_date = new Date().toISOString().split('T')[0];
    }
    const leaderboard = await this.leaderboardRepository.findOne({
      where,
    });

    if (!leaderboard) {
      return null;
    }

    return { rank: leaderboard.rank, score: leaderboard.score };
  }
}

