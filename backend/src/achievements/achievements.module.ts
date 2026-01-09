import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { Achievement } from '../entities/achievement.entity';
import { CharacterAchievement } from '../entities/character-achievement.entity';
import { Character } from '../entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement, CharacterAchievement, Character])],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}

