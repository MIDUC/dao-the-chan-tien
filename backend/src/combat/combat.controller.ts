import { Controller, Post, Get, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CombatService } from './combat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Character } from '../entities/character.entity';

@Controller('combat')
@UseGuards(JwtAuthGuard)
export class CombatController {
  constructor(
    private readonly combatService: CombatService,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  /**
   * Start PvE combat (Player vs Monster)
   */
  @Post('pve')
  async startPvE(
    @Request() req: any,
    @Body() body: { character_id: number; monster_id: number },
  ) {
    const user = req.user;
    // Verify character belongs to user
    const character = await this.characterRepository.findOne({
      where: { id: body.character_id },
    });
    
    if (!character || character.user_id !== user.id) {
      throw new BadRequestException('Character does not belong to user');
    }

    return this.combatService.startPvECombat(body.character_id, body.monster_id);
  }

  /**
   * Start PvP combat (Player vs Player)
   */
  @Post('pvp')
  async startPvP(
    @Request() req: any,
    @Body() body: { character_id: number; opponent_id: number },
  ) {
    const user = req.user;
    // Verify character belongs to user
    const character = await this.characterRepository.findOne({
      where: { id: body.character_id },
    });
    
    if (!character || character.user_id !== user.id) {
      throw new BadRequestException('Character does not belong to user');
    }

    return this.combatService.startPvPCombat(body.character_id, body.opponent_id);
  }

  /**
   * Get battle history
   */
  @Get('history/:characterId')
  async getBattleHistory(
    @Param('characterId') characterId: string,
    @Request() req: any,
  ) {
    const user = req.user;
    const charId = +characterId;
    
    // Verify character belongs to user
    const character = await this.characterRepository.findOne({
      where: { id: charId },
    });
    
    if (!character || character.user_id !== user.id) {
      throw new BadRequestException('Character does not belong to user');
    }

    return this.combatService.getBattleHistory(charId);
  }
}

