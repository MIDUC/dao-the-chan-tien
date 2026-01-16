import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from '../entities/character.entity';
import { Equipment } from '../entities/equipment.entity';
import { CharacterTalent } from '../entities/character-talent.entity';
import { Talent } from '../entities/talent.entity';
import { StatsCalculationService } from './services/stats-calculation.service';
import { StatsController } from './controllers/stats.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      Equipment,
      CharacterTalent,
      Talent,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsCalculationService],
  exports: [StatsCalculationService],
})
export class GameMathModule {}

