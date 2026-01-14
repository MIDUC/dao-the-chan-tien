import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QiService } from './qi.service';
import { QiType } from '../entities/qi.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('qi')
@UseGuards(JwtAuthGuard)
export class QiController {
  constructor(private readonly qiService: QiService) {}

  /**
   * Get character's Qi
   */
  @Get('character/:characterId')
  async getCharacterQi(@Param('characterId') characterId: string) {
    return this.qiService.getCharacterQi(+characterId);
  }

  /**
   * Get specific Qi type
   */
  @Get('character/:characterId/:qiType')
  async getQi(
    @Param('characterId') characterId: string,
    @Param('qiType') qiType: QiType,
  ) {
    return this.qiService.getQi(+characterId, qiType);
  }

  /**
   * Get Qi stats (calculated effects)
   */
  @Get('character/:characterId/stats')
  async getQiStats(@Param('characterId') characterId: string) {
    return this.qiService.calculateQiStats(+characterId);
  }

  /**
   * Add Qi (from activities, quests, etc.)
   */
  @Post('add')
  async addQi(
    @Body() body: { characterId: number; qiType: QiType; amount: number; source?: string },
    @Request() req: any,
  ) {
    const characterId = body.characterId || req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.qiService.addQi(characterId, body.qiType, body.amount, body.source);
  }

  /**
   * Consume Qi
   */
  @Post('consume')
  async consumeQi(
    @Body() body: { characterId: number; qiType: QiType; amount: number },
    @Request() req: any,
  ) {
    const characterId = body.characterId || req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.qiService.consumeQi(characterId, body.qiType, body.amount);
  }

  /**
   * Clear Impure Qi through fitness
   */
  @Post('clear-impure')
  async clearImpureQi(
    @Body() body: { characterId: number; activityType: string },
    @Request() req: any,
  ) {
    const characterId = body.characterId || req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.qiService.clearImpureQi(characterId, body.activityType);
  }

  /**
   * Activate Berserk (Demonic Qi)
   */
  @Post('berserk')
  async activateBerserk(
    @Body() body: { characterId: number },
    @Request() req: any,
  ) {
    const characterId = body.characterId || req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.qiService.activateBerserk(characterId);
  }

  /**
   * Initialize Qi for character (admin/on character creation)
   */
  @Post('initialize/:characterId')
  async initializeQi(@Param('characterId') characterId: string) {
    return this.qiService.initializeCharacterQi(+characterId);
  }
}

