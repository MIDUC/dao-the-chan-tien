import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll() {
    return this.skillsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.skillsService.findOne(+id);
  }

  @Get('character/:characterId')
  async getCharacterSkills(@Param('characterId') characterId: string) {
    return this.skillsService.getCharacterSkills(+characterId);
  }

  @Post('unlock')
  async unlockSkill(@Body() body: { characterId: number; skillId: number }) {
    return this.skillsService.unlockSkill(body.characterId, body.skillId);
  }

  @Post('levelup')
  async levelUpSkill(@Body() body: { characterId: number; skillId: number }) {
    return this.skillsService.levelUpSkill(body.characterId, body.skillId);
  }
}

