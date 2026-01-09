import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { OfflineCultivationService } from './offline-cultivation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offline-cultivation')
@UseGuards(JwtAuthGuard)
export class OfflineCultivationController {
  constructor(
    private readonly offlineCultivationService: OfflineCultivationService,
  ) {}

  /**
   * Get offline cultivation info
   * GET /offline-cultivation/:characterId/info
   */
  @Get(':characterId/info')
  async getInfo(@Param('characterId') characterId: number) {
    return await this.offlineCultivationService.getOfflineCultivationInfo(
      Number(characterId),
    );
  }

  /**
   * Claim offline EXP
   * POST /offline-cultivation/:characterId/claim
   */
  @Post(':characterId/claim')
  async claimExp(@Param('characterId') characterId: number) {
    return await this.offlineCultivationService.claimOfflineExp(Number(characterId));
  }
}

