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
import { QuestsService } from './quests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quests')
@UseGuards(JwtAuthGuard)
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  /**
   * Get all available quests
   */
  @Get('available')
  async getAvailableQuests() {
    return this.questsService.getAvailableQuests();
  }

  /**
   * Get quest by ID
   */
  @Get(':id')
  async getQuestById(@Param('id') id: string) {
    return this.questsService.getQuestById(+id);
  }

  /**
   * Get character's quests
   */
  @Get('character/:characterId')
  async getCharacterQuests(@Param('characterId') characterId: string) {
    return this.questsService.getCharacterQuests(+characterId);
  }

  /**
   * Accept a quest
   */
  @Post(':id/accept')
  async acceptQuest(@Param('id') id: string, @Request() req: any) {
    const characterId = req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.questsService.acceptQuest(characterId, +id);
  }

  /**
   * Update quest progress
   */
  @Put(':id/progress')
  async updateQuestProgress(
    @Param('id') id: string,
    @Body() body: { progress: number },
    @Request() req: any,
  ) {
    const characterId = req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.questsService.updateQuestProgress(characterId, +id, body.progress);
  }

  /**
   * Complete a quest
   */
  @Post(':id/complete')
  async completeQuest(@Param('id') id: string, @Request() req: any) {
    const characterId = req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.questsService.completeQuest(characterId, +id);
  }

  /**
   * Abandon a quest
   */
  @Post(':id/abandon')
  async abandonQuest(@Param('id') id: string, @Request() req: any) {
    const characterId = req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.questsService.abandonQuest(characterId, +id);
  }
}

