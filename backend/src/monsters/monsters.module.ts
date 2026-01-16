import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Monster } from '../entities/monster.entity';
import { MonsterSkill } from '../entities/monster-skill.entity';
import { MonstersService } from './monsters.service';
import { MonstersController } from './monsters.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Monster, MonsterSkill]),
    RolesModule,
  ],
  controllers: [MonstersController],
  providers: [MonstersService],
  exports: [MonstersService],
})
export class MonstersModule {}

