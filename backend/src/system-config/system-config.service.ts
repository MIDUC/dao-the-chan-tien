import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../entities/system-config.entity';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {}

  /**
   * Get config value by key
   * @param key Config key
   * @param defaultValue Default value if not found
   * @returns Config value or default
   */
  async getConfig(key: string, defaultValue: string = ''): Promise<string> {
    const config = await this.configRepository.findOne({
      where: { key, is_active: true },
    });
    return config?.value || defaultValue;
  }

  /**
   * Get config as number
   */
  async getConfigNumber(key: string, defaultValue: number = 0): Promise<number> {
    const value = await this.getConfig(key, defaultValue.toString());
    return parseFloat(value) || defaultValue;
  }

  /**
   * Get config as boolean
   */
  async getConfigBoolean(key: string, defaultValue: boolean = false): Promise<boolean> {
    const value = await this.getConfig(key, defaultValue.toString());
    return value.toLowerCase() === 'true';
  }

  /**
   * Set config value
   */
  async setConfig(key: string, value: string, description?: string): Promise<SystemConfig> {
    let config = await this.configRepository.findOne({
      where: { key },
    });

    if (config) {
      config.value = value;
      if (description) {
        config.description = description;
      }
    } else {
      config = this.configRepository.create({
        key,
        value,
        description,
        is_active: true,
      });
    }

    return this.configRepository.save(config);
  }

  /**
   * Get all configs
   */
  async getAllConfigs(): Promise<SystemConfig[]> {
    return this.configRepository.find({
      order: { key: 'ASC' },
    });
  }

  /**
   * Delete config
   */
  async deleteConfig(key: string): Promise<void> {
    await this.configRepository.delete({ key });
  }
}

