import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentSlot } from '../entities/equipment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('equipment')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  /**
   * Get character's equipped items
   */
  @Get('character/:characterId')
  async getCharacterEquipment(@Param('characterId') characterId: string) {
    return this.equipmentService.getCharacterEquipment(+characterId);
  }

  /**
   * Get equipment by slot
   */
  @Get('character/:characterId/slot/:slot')
  async getEquipmentBySlot(
    @Param('characterId') characterId: string,
    @Param('slot') slot: EquipmentSlot,
  ) {
    return this.equipmentService.getEquipmentBySlot(+characterId, slot);
  }

  /**
   * Equip an item from inventory
   */
  @Post('equip')
  async equipItem(
    @Body() body: { inventoryId: number; slot: EquipmentSlot; characterId?: number },
    @Request() req: any,
  ) {
    console.log('=== EQUIP REQUEST ===');
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('Body.characterId:', body.characterId);
    console.log('Body type:', typeof body.characterId);
    console.log('Req.user:', req.user ? 'exists' : 'null');
    console.log('Req.user.characters:', req.user?.characters);
    console.log('Req.user.characters[0]:', req.user?.characters?.[0]);
    console.log('Req.user.characters[0]?.id:', req.user?.characters?.[0]?.id);
    console.log('Req.body:', req.body);
    console.log('Req.body.characterId:', req.body?.characterId);
    
    // Try multiple ways to get characterId
    const characterId = 
      body.characterId || 
      req.body?.characterId || 
      req.user?.characters?.[0]?.id ||
      (req.user?.characters && req.user.characters.length > 0 ? req.user.characters[0].id : null);
    
    // Ensure it's a number
    const finalCharacterId = characterId ? Number(characterId) : null;
    console.log('Final characterId:', finalCharacterId);
    console.log('===================');
    
    if (!finalCharacterId || isNaN(finalCharacterId)) {
      console.error('ERROR: Character not found! characterId:', finalCharacterId);
      return { success: false, message: 'Character not found' };
    }
    return this.equipmentService.equipItem(finalCharacterId, body.inventoryId, body.slot);
  }

  /**
   * Unequip an item
   */
  @Delete('unequip/:slot')
  async unequipItem(@Param('slot') slot: EquipmentSlot, @Request() req: any) {
    const characterId = req.user.characters?.[0]?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.equipmentService.unequipItem(characterId, slot);
  }

  /**
   * Get total equipment stats
   */
  @Get('character/:characterId/stats')
  async getTotalEquipmentStats(@Param('characterId') characterId: string) {
    return this.equipmentService.getTotalEquipmentStats(+characterId);
  }

  /**
   * Get character's total stats (base + equipment)
   */
  @Get('character/:characterId/total-stats')
  async getCharacterTotalStats(@Param('characterId') characterId: string) {
    return this.equipmentService.getCharacterTotalStats(+characterId);
  }

  // ========== Ancient Artifact (Cổ Bảo) Endpoints ==========

  /**
   * Get all Ancient Artifacts for a character
   */
  @Get('character/:characterId/artifacts')
  async getCharacterArtifacts(@Param('characterId') characterId: string) {
    return this.equipmentService.getCharacterArtifacts(+characterId);
  }

  /**
   * Equip an Ancient Artifact (Cổ Bảo)
   */
  @Post('equip-artifact')
  async equipAncientArtifact(
    @Body() body: { inventoryId: number; characterId?: number },
    @Request() req: any,
  ) {
    const characterId = body.characterId || req.user.characters?.[0]?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.equipmentService.equipAncientArtifact(characterId, body.inventoryId);
  }

  /**
   * Unequip an Ancient Artifact
   */
  @Delete('unequip-artifact/:artifactId')
  async unequipAncientArtifact(@Param('artifactId') artifactId: string, @Request() req: any) {
    const characterId = req.user.characters?.[0]?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }
    return this.equipmentService.unequipAncientArtifact(characterId, +artifactId);
  }

  /**
   * Get available artifact slots count
   */
  @Get('character/:characterId/artifact-slots')
  async getAvailableArtifactSlots(@Param('characterId') characterId: string) {
    return this.equipmentService.getAvailableArtifactSlotsInfo(+characterId);
  }
}

