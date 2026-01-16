import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  /**
   * Get all skills (global + personal for current user)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    const characterId = req.user?.character?.id;
    return this.skillsService.findAll(characterId);
  }

  /**
   * Get skill by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.findOne(id);
  }

  /**
   * Get character's skills
   */
  @Get('character/:characterId')
  @UseGuards(JwtAuthGuard)
  async getCharacterSkills(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Request() req,
  ) {
    const userCharacterId = req.user.character?.id;
    if (userCharacterId && userCharacterId !== characterId) {
      throw new UnauthorizedException('Character does not belong to user');
    }
    return this.skillsService.getCharacterSkills(characterId);
  }

  /**
   * Learn a skill
   */
  @Post('character/:characterId/learn')
  @UseGuards(JwtAuthGuard)
  async learnSkill(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Body() body: { skillId: number },
    @Request() req,
  ) {
    const userCharacterId = req.user.character?.id;
    if (userCharacterId && userCharacterId !== characterId) {
      throw new UnauthorizedException('Character does not belong to user');
    }
    return this.skillsService.learnSkill(characterId, body.skillId);
  }

  /**
   * Calculate skill damage
   */
  @Get('character/:characterId/:skillId/damage')
  @UseGuards(JwtAuthGuard)
  async calculateDamage(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Request() req,
  ) {
    const userCharacterId = req.user.character?.id;
    if (userCharacterId && userCharacterId !== characterId) {
      throw new UnauthorizedException('Character does not belong to user');
    }
    return this.skillsService.calculateSkillDamage(characterId, skillId);
  }
}
