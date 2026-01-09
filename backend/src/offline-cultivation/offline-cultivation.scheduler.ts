import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OfflineCultivationService } from './offline-cultivation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../entities/character.entity';
import { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class OfflineCultivationScheduler implements OnModuleInit {
  constructor(
    private offlineCultivationService: OfflineCultivationService,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private configService: SystemConfigService,
  ) {}

  async onModuleInit() {
    // Initialize default configs if they don't exist
    await this.initializeDefaultConfigs();
  }

  /**
   * Initialize default system configs
   */
  private async initializeDefaultConfigs() {
    const defaultConfigs = [
      {
        key: 'cultivation_interval_seconds',
        value: '60',
        description: 'Thời gian (giây) giữa mỗi lần cộng EXP tự động. Mặc định: 60 giây (1 phút)',
      },
      {
        key: 'base_exp_rate',
        value: '10',
        description: 'EXP cơ bản mỗi giờ. Mặc định: 10 EXP/giờ',
      },
    ];

    for (const config of defaultConfigs) {
      const existing = await this.configService.getConfig(config.key);
      if (!existing) {
        await this.configService.setConfig(config.key, config.value, config.description);
      }
    }
  }

  /**
   * Process passive cultivation for all characters
   * Runs every minute (configurable via cultivation_interval_seconds)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processAllCharactersCultivation() {
    try {
      // Get all active characters
      const characters = await this.characterRepository.find();

      if (characters.length === 0) {
        return;
      }

      // Get cultivation interval from config
      const interval = await this.configService.getConfigNumber('cultivation_interval_seconds', 60);

      let totalExpGained = 0;
      let charactersUpdated = 0;

      // Process each character
      for (const character of characters) {
        try {
          const result = await this.offlineCultivationService.processPassiveCultivation(character.id);
          if (result.updated) {
            totalExpGained += result.expGained;
            charactersUpdated++;
          }
        } catch (error) {
          console.error(`Error processing cultivation for character ${character.id}:`, error);
        }
      }

      if (charactersUpdated > 0) {
        console.log(
          `✅ Auto EXP: Updated ${charactersUpdated}/${characters.length} characters, Total EXP: ${totalExpGained.toFixed(2)}`,
        );
      }
    } catch (error) {
      console.error('Error in cultivation scheduler:', error);
    }
  }
}

