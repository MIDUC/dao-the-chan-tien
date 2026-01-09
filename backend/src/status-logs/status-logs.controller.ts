import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StatusLogsService } from './status-logs.service';
import { StatusLogType } from '../entities/status-log.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('status-logs')
@UseGuards(JwtAuthGuard)
export class StatusLogsController {
  constructor(private readonly statusLogsService: StatusLogsService) {}

  /**
   * Get status logs for current character
   * Automatically determines scope based on character's party/guild membership
   */
  @Get('character/:characterId')
  async getCharacterStatusLogs(
    @Param('characterId') characterId: string,
    @Query('type') type?: StatusLogType,
  ) {
    const filters = type ? { type } : undefined;
    return this.statusLogsService.getStatusLogs(+characterId, filters);
  }

  /**
   * Get public status logs (no user_id, party_id, guild_id)
   */
  @Get('public')
  async getPublicStatusLogs(@Query('type') type?: StatusLogType) {
    const filters = type ? { type } : undefined;
    return this.statusLogsService.getStatusLogs(undefined, filters);
  }

  /**
   * Get status logs by party ID
   */
  @Get('party/:partyId')
  async getPartyStatusLogs(
    @Param('partyId') partyId: string,
    @Query('type') type?: StatusLogType,
  ) {
    const filters = type ? { type } : undefined;
    return this.statusLogsService.getStatusLogsByParty(+partyId, filters);
  }

  /**
   * Get status logs by guild ID
   */
  @Get('guild/:guildId')
  async getGuildStatusLogs(
    @Param('guildId') guildId: string,
    @Query('type') type?: StatusLogType,
  ) {
    const filters = type ? { type } : undefined;
    return this.statusLogsService.getStatusLogsByGuild(+guildId, filters);
  }

  /**
   * Create a new status log
   */
  @Post()
  async createStatusLog(
    @Body()
    body: {
      character_id?: number;
      party_id?: number;
      guild_id?: number;
      type: StatusLogType;
      message: string;
    },
  ) {
    return this.statusLogsService.createStatusLog(body);
  }
}

