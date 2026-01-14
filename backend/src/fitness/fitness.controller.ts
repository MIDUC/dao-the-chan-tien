import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FitnessService, FitnessActivityType } from './fitness.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fitness')
@UseGuards(JwtAuthGuard)
export class FitnessController {
  constructor(private readonly fitnessService: FitnessService) {}

  /**
   * Record fitness activity
   */
  @Post('record')
  async recordActivity(
    @Body() body: {
      characterId?: number;
      activityType: FitnessActivityType;
      quantity: number;
      metadata?: any;
    },
    @Request() req: any,
  ) {
    const characterId = body.characterId || req.user.characterId || req.user.character?.id;
    if (!characterId) {
      return { success: false, message: 'Character not found' };
    }

    return this.fitnessService.recordActivity(
      characterId,
      body.activityType,
      body.quantity || 1,
      body.metadata,
    );
  }
}

