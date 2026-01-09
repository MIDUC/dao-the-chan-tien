import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(NPC)
    private npcRepository: Repository<NPC>,
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
    private rolesService: RolesService,
  ) {}

  // ========== USER MANAGEMENT ==========
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['characters', 'roles'],
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['characters', 'roles'],
    });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async assignRoleToUser(userId: number, roleIds: number[]): Promise<User> {
    return this.rolesService.assignRolesToUser(userId, roleIds);
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<User> {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }

  // ========== CHARACTER MANAGEMENT ==========
  async getAllCharacters(): Promise<Character[]> {
    return this.characterRepository.find({
      relations: ['user'],
    });
  }

  async getCharacterById(id: number): Promise<Character | null> {
    return this.characterRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async updateCharacter(
    id: number,
    data: Partial<Character>,
  ): Promise<Character> {
    await this.characterRepository.update(id, data);
    const character = await this.getCharacterById(id);
    if (!character) {
      throw new Error(`Character with id ${id} not found`);
    }
    return character;
  }

  async deleteCharacter(id: number): Promise<void> {
    await this.characterRepository.delete(id);
  }

  // ========== ITEM MANAGEMENT ==========
  async getAllItems(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  async getItemById(id: number): Promise<Item | null> {
    return this.itemRepository.findOne({ where: { id } });
  }

  async createItem(itemData: Partial<Item>): Promise<Item> {
    const item = this.itemRepository.create(itemData);
    return this.itemRepository.save(item);
  }

  async updateItem(id: number, data: Partial<Item>): Promise<Item> {
    await this.itemRepository.update(id, data);
    const item = await this.getItemById(id);
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }
    return item;
  }

  async deleteItem(id: number): Promise<void> {
    await this.itemRepository.delete(id);
  }

  // ========== NPC MANAGEMENT ==========
  async getAllNPCs(): Promise<NPC[]> {
    return this.npcRepository.find({ relations: ['quests'] });
  }

  async getNPCById(id: number): Promise<NPC | null> {
    return this.npcRepository.findOne({
      where: { id },
      relations: ['quests'],
    });
  }

  async createNPC(npcData: Partial<NPC>): Promise<NPC> {
    const npc = this.npcRepository.create(npcData);
    return this.npcRepository.save(npc);
  }

  async updateNPC(id: number, data: Partial<NPC>): Promise<NPC> {
    await this.npcRepository.update(id, data);
    const npc = await this.getNPCById(id);
    if (!npc) {
      throw new Error(`NPC with id ${id} not found`);
    }
    return npc;
  }

  async deleteNPC(id: number): Promise<void> {
    await this.npcRepository.delete(id);
  }

  // ========== QUEST MANAGEMENT ==========
  async getAllQuests(): Promise<Quest[]> {
    return this.questRepository.find({ relations: ['npc'] });
  }

  async getQuestById(id: number): Promise<Quest | null> {
    return this.questRepository.findOne({
      where: { id },
      relations: ['npc'],
    });
  }

  async createQuest(questData: Partial<Quest>): Promise<Quest> {
    const quest = this.questRepository.create(questData);
    return this.questRepository.save(quest);
  }

  async updateQuest(id: number, data: Partial<Quest>): Promise<Quest> {
    await this.questRepository.update(id, data);
    const quest = await this.getQuestById(id);
    if (!quest) {
      throw new Error(`Quest with id ${id} not found`);
    }
    return quest;
  }

  async deleteQuest(id: number): Promise<void> {
    await this.questRepository.delete(id);
  }

  // ========== ROLE MANAGEMENT ==========
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    await this.roleRepository.update(id, data);
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new Error(`Role with id ${id} not found`);
    }
    return role;
  }

  async deleteRole(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }

  // ========== ACHIEVEMENT MANAGEMENT ==========
  async getAllAchievements(): Promise<Achievement[]> {
    return this.achievementRepository.find();
  }

  async createAchievement(
    achievementData: Partial<Achievement>,
  ): Promise<Achievement> {
    const achievement = this.achievementRepository.create(achievementData);
    return this.achievementRepository.save(achievement);
  }

  async updateAchievement(
    id: number,
    data: Partial<Achievement>,
  ): Promise<Achievement> {
    await this.achievementRepository.update(id, data);
    const achievement = await this.achievementRepository.findOne({
      where: { id },
    });
    if (!achievement) {
      throw new Error(`Achievement with id ${id} not found`);
    }
    return achievement;
  }

  async deleteAchievement(id: number): Promise<void> {
    await this.achievementRepository.delete(id);
  }

  // ========== SHOP MANAGEMENT ==========
  async getAllShops(): Promise<Shop[]> {
    return this.shopRepository.find({ relations: ['items'] });
  }

  async createShop(shopData: Partial<Shop>): Promise<Shop> {
    const shop = this.shopRepository.create(shopData);
    return this.shopRepository.save(shop);
  }

  async updateShop(id: number, data: Partial<Shop>): Promise<Shop> {
    await this.shopRepository.update(id, data);
    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) {
      throw new Error(`Shop with id ${id} not found`);
    }
    return shop;
  }

  async deleteShop(id: number): Promise<void> {
    await this.shopRepository.delete(id);
  }

  // ========== SKILL MANAGEMENT ==========
  async getAllSkills(): Promise<Skill[]> {
    return this.skillRepository.find();
  }

  async createSkill(skillData: Partial<Skill>): Promise<Skill> {
    const skill = this.skillRepository.create(skillData);
    return this.skillRepository.save(skill);
  }

  async updateSkill(id: number, data: Partial<Skill>): Promise<Skill> {
    await this.skillRepository.update(id, data);
    const skill = await this.skillRepository.findOne({
      where: { id },
    });
    if (!skill) {
      throw new Error(`Skill with id ${id} not found`);
    }
    return skill;
  }

  async deleteSkill(id: number): Promise<void> {
    await this.skillRepository.delete(id);
  }

  // ========== SYSTEM CONFIG MANAGEMENT ==========
  async getAllSystemConfigs(): Promise<SystemConfig[]> {
    return this.systemConfigRepository.find({
      order: { key: 'ASC' },
    });
  }

  async getSystemConfigByKey(key: string): Promise<SystemConfig | null> {
    return this.systemConfigRepository.findOne({ where: { key } });
  }

  async createSystemConfig(data: Partial<SystemConfig>): Promise<SystemConfig> {
    const config = this.systemConfigRepository.create(data);
    return this.systemConfigRepository.save(config);
  }

  async updateSystemConfig(key: string, data: Partial<SystemConfig>): Promise<SystemConfig> {
    await this.systemConfigRepository.update({ key }, data);
    const updated = await this.systemConfigRepository.findOne({ where: { key } });
    if (!updated) {
      throw new NotFoundException(`System config with key ${key} not found`);
    }
    return updated;
  }

  async deleteSystemConfig(key: string): Promise<void> {
    await this.systemConfigRepository.delete({ key });
  }

  // ========== UTILITY METHODS ==========
  async removeItemSuffixes(): Promise<{ updated: number; items: Array<{ old: string; new: string }> }> {
    const items = await this.itemRepository.find();
    const updatedItems: Array<{ old: string; new: string }> = [];
    let updatedCount = 0;

    for (const item of items) {
      const originalName = item.name;
      // Remove patterns like [Lục], [Vàng], [Tím], [Lam], [Đỏ], [Trắng], [Xám]
      const newName = originalName.replace(
        /\s*\[(Lục|Vàng|Tím|Lam|Đỏ|Trắng|Xám)\]\s*$/i,
        '',
      ).trim();

      if (originalName !== newName) {
        item.name = newName;
        await this.itemRepository.save(item);
        updatedCount++;
        updatedItems.push({ old: originalName, new: newName });
      }
    }

    return { updated: updatedCount, items: updatedItems };
  }
}
