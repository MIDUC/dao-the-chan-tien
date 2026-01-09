import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../entities/user.entity';
import { Character } from '../entities/character.entity';
import { Item } from '../entities/item.entity';
import { NPC } from '../entities/npc.entity';
import { Quest } from '../entities/quest.entity';
import { Role } from '../entities/role.entity';
import { Achievement } from '../entities/achievement.entity';
import { Shop } from '../entities/shop.entity';
import { Skill } from '../entities/skill.entity';
import { SystemConfig } from '../entities/system-config.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== USER MANAGEMENT ==========
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(+id);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: Partial<User>) {
    return this.adminService.updateUser(+id, data);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }

  @Post('users/:id/roles')
  async assignRole(@Param('id') id: string, @Body() body: { roleIds: number[] }) {
    return this.adminService.assignRoleToUser(+id, body.roleIds);
  }

  @Delete('users/:id/roles/:roleId')
  async removeRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return this.adminService.removeRoleFromUser(+id, +roleId);
  }

  // ========== CHARACTER MANAGEMENT ==========
  @Get('characters')
  async getAllCharacters() {
    return this.adminService.getAllCharacters();
  }

  @Get('characters/:id')
  async getCharacterById(@Param('id') id: string) {
    return this.adminService.getCharacterById(+id);
  }

  @Put('characters/:id')
  async updateCharacter(@Param('id') id: string, @Body() data: Partial<Character>) {
    return this.adminService.updateCharacter(+id, data);
  }

  @Delete('characters/:id')
  async deleteCharacter(@Param('id') id: string) {
    return this.adminService.deleteCharacter(+id);
  }

  // ========== ITEM MANAGEMENT ==========
  @Get('items')
  async getAllItems() {
    return this.adminService.getAllItems();
  }

  @Get('items/:id')
  async getItemById(@Param('id') id: string) {
    return this.adminService.getItemById(+id);
  }

  @Post('items')
  async createItem(@Body() data: Partial<Item>) {
    return this.adminService.createItem(data);
  }

  @Put('items/:id')
  async updateItem(@Param('id') id: string, @Body() data: Partial<Item>) {
    return this.adminService.updateItem(+id, data);
  }

  @Delete('items/:id')
  async deleteItem(@Param('id') id: string) {
    return this.adminService.deleteItem(+id);
  }

  // ========== NPC MANAGEMENT ==========
  @Get('npcs')
  async getAllNPCs() {
    return this.adminService.getAllNPCs();
  }

  @Get('npcs/:id')
  async getNPCById(@Param('id') id: string) {
    return this.adminService.getNPCById(+id);
  }

  @Post('npcs')
  async createNPC(@Body() data: Partial<NPC>) {
    return this.adminService.createNPC(data);
  }

  @Put('npcs/:id')
  async updateNPC(@Param('id') id: string, @Body() data: Partial<NPC>) {
    return this.adminService.updateNPC(+id, data);
  }

  @Delete('npcs/:id')
  async deleteNPC(@Param('id') id: string) {
    return this.adminService.deleteNPC(+id);
  }

  // ========== QUEST MANAGEMENT ==========
  @Get('quests')
  async getAllQuests() {
    return this.adminService.getAllQuests();
  }

  @Get('quests/:id')
  async getQuestById(@Param('id') id: string) {
    return this.adminService.getQuestById(+id);
  }

  @Post('quests')
  async createQuest(@Body() data: Partial<Quest>) {
    return this.adminService.createQuest(data);
  }

  @Put('quests/:id')
  async updateQuest(@Param('id') id: string, @Body() data: Partial<Quest>) {
    return this.adminService.updateQuest(+id, data);
  }

  @Delete('quests/:id')
  async deleteQuest(@Param('id') id: string) {
    return this.adminService.deleteQuest(+id);
  }

  // ========== ROLE MANAGEMENT ==========
  @Get('roles')
  async getAllRoles() {
    return this.adminService.getAllRoles();
  }

  @Post('roles')
  async createRole(@Body() data: Partial<Role>) {
    return this.adminService.createRole(data);
  }

  @Put('roles/:id')
  async updateRole(@Param('id') id: string, @Body() data: Partial<Role>) {
    return this.adminService.updateRole(+id, data);
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    return this.adminService.deleteRole(+id);
  }

  // ========== ACHIEVEMENT MANAGEMENT ==========
  @Get('achievements')
  async getAllAchievements() {
    return this.adminService.getAllAchievements();
  }

  @Post('achievements')
  async createAchievement(@Body() data: Partial<Achievement>) {
    return this.adminService.createAchievement(data);
  }

  @Put('achievements/:id')
  async updateAchievement(@Param('id') id: string, @Body() data: Partial<Achievement>) {
    return this.adminService.updateAchievement(+id, data);
  }

  @Delete('achievements/:id')
  async deleteAchievement(@Param('id') id: string) {
    return this.adminService.deleteAchievement(+id);
  }

  // ========== SHOP MANAGEMENT ==========
  @Get('shops')
  async getAllShops() {
    return this.adminService.getAllShops();
  }

  @Post('shops')
  async createShop(@Body() data: Partial<Shop>) {
    return this.adminService.createShop(data);
  }

  @Put('shops/:id')
  async updateShop(@Param('id') id: string, @Body() data: Partial<Shop>) {
    return this.adminService.updateShop(+id, data);
  }

  @Delete('shops/:id')
  async deleteShop(@Param('id') id: string) {
    return this.adminService.deleteShop(+id);
  }

  // ========== SKILL MANAGEMENT ==========
  @Get('skills')
  async getAllSkills() {
    return this.adminService.getAllSkills();
  }

  @Post('skills')
  async createSkill(@Body() data: Partial<Skill>) {
    return this.adminService.createSkill(data);
  }

  @Put('skills/:id')
  async updateSkill(@Param('id') id: string, @Body() data: Partial<Skill>) {
    return this.adminService.updateSkill(+id, data);
  }

  @Delete('skills/:id')
  async deleteSkill(@Param('id') id: string) {
    return this.adminService.deleteSkill(+id);
  }

  // ========== SYSTEM CONFIG MANAGEMENT ==========
  @Get('system-configs')
  async getAllSystemConfigs() {
    return this.adminService.getAllSystemConfigs();
  }

  @Get('system-configs/:key')
  async getSystemConfigByKey(@Param('key') key: string) {
    return this.adminService.getSystemConfigByKey(key);
  }

  @Post('system-configs')
  async createSystemConfig(@Body() data: Partial<SystemConfig>) {
    return this.adminService.createSystemConfig(data);
  }

  @Put('system-configs/:key')
  async updateSystemConfig(
    @Param('key') key: string,
    @Body() data: Partial<SystemConfig>,
  ) {
    return this.adminService.updateSystemConfig(key, data);
  }

  @Delete('system-configs/:key')
  async deleteSystemConfig(@Param('key') key: string) {
    await this.adminService.deleteSystemConfig(key);
    return { success: true };
  }

  // ========== UTILITY ENDPOINTS ==========
  @Post('items/remove-suffixes')
  async removeItemSuffixes() {
    return this.adminService.removeItemSuffixes();
  }
}

