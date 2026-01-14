import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QiController } from './qi.controller';
import { QiService } from './qi.service';
import { CharacterQi, QiType } from '../entities/qi.entity';
import { QiEffect } from '../entities/qi.entity';
import { Character } from '../entities/character.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([CharacterQi, QiEffect, Character]),
    ScheduleModule,
  ],
  controllers: [QiController],
  providers: [QiService],
  exports: [QiService],
})
export class QiModule {}

