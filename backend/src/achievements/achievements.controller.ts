import { Controller, Get, Param, Post } from '@nestjs/common';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  async findAll() {
    return this.achievementsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.achievementsService.findOne(+id);
  }

  @Get('character/:characterId')
  async getCharacterAchievements(@Param('characterId') characterId: string) {
    return this.achievementsService.getCharacterAchievements(+characterId);
  }

  @Post('unlock')
  async unlockAchievement(
    @Param() params: { characterId: number; achievementId: number },
  ) {
    return this.achievementsService.checkAndUnlockAchievement(
      params.characterId,
      params.achievementId,
    );
  }

  @Post('claim/:characterId/:achievementId')
  async claimReward(
    @Param('characterId') characterId: string,
    @Param('achievementId') achievementId: string,
  ) {
    return this.achievementsService.claimReward(+characterId, +achievementId);
  }
}

