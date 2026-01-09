import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('system-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  /**
   * Get all configs (admin only)
   */
  @Get()
  @Roles('admin')
  async getAllConfigs() {
    return this.configService.getAllConfigs();
  }

  /**
   * Get config by key
   */
  @Get(':key')
  async getConfig(@Param('key') key: string) {
    return { key, value: await this.configService.getConfig(key) };
  }

  /**
   * Set config (admin only)
   */
  @Post()
  @Roles('admin')
  async setConfig(
    @Body() body: { key: string; value: string; description?: string },
  ) {
    return this.configService.setConfig(body.key, body.value, body.description);
  }

  /**
   * Update config (admin only)
   */
  @Put(':key')
  @Roles('admin')
  async updateConfig(
    @Param('key') key: string,
    @Body() body: { value: string; description?: string },
  ) {
    return this.configService.setConfig(key, body.value, body.description);
  }

  /**
   * Delete config (admin only)
   */
  @Delete(':key')
  @Roles('admin')
  async deleteConfig(@Param('key') key: string) {
    await this.configService.deleteConfig(key);
    return { success: true };
  }
}

