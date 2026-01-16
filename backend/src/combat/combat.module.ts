import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleLog } from '../entities/battle-log.entity';
import { Character } from '../entities/character.entity';
import { Monster } from '../entities/monster.entity';
import { MonsterSkill } from '../entities/monster-skill.entity';
import { CharacterSkill } from '../entities/character-skill.entity';
import { CombatService } from './combat.service';
import { CombatController } from './combat.controller';
import { MonstersModule } from '../monsters/monsters.module';
import { StatsModule } from '../stats/stats.module';
import { SkillsModule } from '../skills/skills.module';
import { CurrencyModule } from '../currency/currency.module';
import { ItemsModule } from '../items/items.module';
import { ElementsModule } from '../elements/elements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BattleLog, Character, Monster, MonsterSkill, CharacterSkill]),
    MonstersModule,
    StatsModule,
    SkillsModule,
    CurrencyModule,
    ItemsModule,
    ElementsModule,
  ],
  controllers: [CombatController],
  providers: [CombatService],
  exports: [CombatService],
})
export class CombatModule {}

