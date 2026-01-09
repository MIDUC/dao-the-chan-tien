import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { Skill } from '../entities/skill.entity';
import { CharacterSkill } from '../entities/character-skill.entity';
import { Character } from '../entities/character.entity';
import { Inventory } from '../entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, CharacterSkill, Character, Inventory])],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}

