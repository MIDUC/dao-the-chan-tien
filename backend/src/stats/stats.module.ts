import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Character } from '../entities/character.entity';
import { EquipmentModule } from '../equipment/equipment.module';
import { QiModule } from '../qi/qi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
    forwardRef(() => EquipmentModule),
    forwardRef(() => QiModule),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}

