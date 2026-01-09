import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfflineCultivationService } from './offline-cultivation.service';
import { OfflineCultivationController } from './offline-cultivation.controller';
import { OfflineCultivationScheduler } from './offline-cultivation.scheduler';
import { Character } from '../entities/character.entity';
import { Equipment } from '../entities/equipment.entity';
import { CharacterSkill } from '../entities/character-skill.entity';
import { CharacterAchievement } from '../entities/character-achievement.entity';
import { ItemEffect } from '../entities/item-effect.entity';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      Equipment,
      CharacterSkill,
      CharacterAchievement,
      ItemEffect,
    ]),
    forwardRef(() => SystemConfigModule),
  ],
  controllers: [OfflineCultivationController],
  providers: [OfflineCultivationService, OfflineCultivationScheduler],
  exports: [OfflineCultivationService],
})
export class OfflineCultivationModule {}

