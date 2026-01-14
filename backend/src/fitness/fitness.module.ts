import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FitnessController } from './fitness.controller';
import { FitnessService } from './fitness.service';
import { Character } from '../entities/character.entity';
import { StatsModule } from '../stats/stats.module';
import { QiModule } from '../qi/qi.module';
import { QiType } from '../entities/qi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
    StatsModule,
    QiModule,
  ],
  controllers: [FitnessController],
  providers: [FitnessService],
  exports: [FitnessService],
})
export class FitnessModule {}

