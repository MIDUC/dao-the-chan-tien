import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TalentsController } from './talents.controller';
import { TalentsService } from './talents.service';
import { Talent } from '../entities/talent.entity';
import { CharacterTalent } from '../entities/character-talent.entity';
import { Character } from '../entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Talent, CharacterTalent, Character])],
  controllers: [TalentsController],
  providers: [TalentsService],
  exports: [TalentsService],
})
export class TalentsModule {}

