import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { Skill } from '../entities/skill.entity';
import { CharacterSkill } from '../entities/character-skill.entity';
import { Character } from '../entities/character.entity';
import { ElementsModule } from '../elements/elements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, CharacterSkill, Character]),
    ElementsModule,
  ],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
