import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { TalentsService } from './talents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('talents')
export class TalentsController {
  constructor(private readonly talentsService: TalentsService) {}

  /**
   * Get all talents
   */
  @Get()
  async findAll() {
    return this.talentsService.findAll();
  }

  /**
   * Get starter talents (for registration)
   */
  @Get('starters')
  async findStarterTalents() {
    return this.talentsService.findStarterTalents();
  }

  /**
   * Get character's talents (must be before :id route)
   */
  @Get('character/:characterId')
  @UseGuards(JwtAuthGuard)
  async getCharacterTalents(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Request() req,
  ) {
    // Verify character belongs to user
    const userCharacterId = req.user.character?.id;
    if (userCharacterId && userCharacterId !== characterId) {
      throw new UnauthorizedException('Character does not belong to user');
    }
    return this.talentsService.getCharacterTalents(characterId);
  }

  /**
   * Get talent by ID (must be after specific routes like 'character/:characterId')
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.talentsService.findOne(id);
  }

  /**
   * Add talent to character
   */
  @Post('character/:characterId/add')
  @UseGuards(JwtAuthGuard)
  async addTalentToCharacter(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Body() body: { talentId: number; obtainedFrom?: string },
    @Request() req,
  ) {
    // Verify character belongs to user
    const userCharacterId = req.user.character?.id;
    if (userCharacterId && userCharacterId !== characterId) {
      throw new UnauthorizedException('Character does not belong to user');
    }
    return this.talentsService.addTalentToCharacter(
      characterId,
      body.talentId,
      body.obtainedFrom || 'manual',
    );
  }

  /**
   * Remove talent from character
   */
  @Delete('character/:characterId/:talentId')
  @UseGuards(JwtAuthGuard)
  async removeTalentFromCharacter(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Param('talentId', ParseIntPipe) talentId: number,
    @Request() req,
  ) {
    // Verify character belongs to user
    const userCharacterId = req.user.character?.id;
    if (userCharacterId && userCharacterId !== characterId) {
      throw new UnauthorizedException('Character does not belong to user');
    }
    await this.talentsService.removeTalentFromCharacter(characterId, talentId);
    return { success: true };
  }
}

