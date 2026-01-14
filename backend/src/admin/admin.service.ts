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
  async getAllUsers(page: number = 1, pageSize: number = 20): Promise<{
    data: User[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * pageSize;
    const [data, total] = await this.userRepository.findAndCount({
      relations: ['characters', 'roles'],
      skip,
      take: pageSize,
      order: { id: 'ASC' },
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
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
  async getAllItems(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    itemType?: string,
    rarity?: string,
  ): Promise<{
    data: Item[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    // Đảm bảo page và pageSize hợp lệ
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(100, pageSize)); // Max 100 items per page
    const skip = (validPage - 1) * validPageSize;

    console.log('AdminService.getAllItems - Input:', {
      page,
      pageSize,
      validPage,
      validPageSize,
      skip,
      search,
      itemType,
      rarity,
    });

    // Build where conditions
    const whereConditions: any = {};
    
    if (itemType && itemType.trim()) {
      whereConditions.item_type = itemType.trim();
    }

    if (rarity && rarity.trim()) {
      whereConditions.rarity = rarity.trim();
    }

    // Build query options - chỉ thêm where nếu có điều kiện
    const findOptions: any = {
      skip: skip,
      take: validPageSize,
      order: {
        id: 'ASC',
      },
    };
    
    if (Object.keys(whereConditions).length > 0) {
      findOptions.where = whereConditions;
    }

    // Nếu có search, phải dùng query builder vì cần LIKE
    if (search && search.trim()) {
      const queryBuilder = this.itemRepository.createQueryBuilder('item');
      
      // Apply where conditions
      if (Object.keys(whereConditions).length > 0) {
        Object.entries(whereConditions).forEach(([key, value]) => {
          queryBuilder.andWhere(`item.${key} = :${key}`, { [key]: value });
        });
      }
      
      // Apply search
      queryBuilder.andWhere(
        '(item.name LIKE :search OR item.description LIKE :search)',
        { search: `%${search.trim()}%` },
      );
      
      // Count query (clone trước khi thêm skip/take)
      const countQuery = queryBuilder.clone();
      
      // Data query với pagination - QUAN TRỌNG: skip và take phải được gọi trước getMany()
      queryBuilder
        .skip(skip)
        .take(validPageSize)
        .orderBy('item.id', 'ASC');
      
      const sql = queryBuilder.getSql();
      const params = queryBuilder.getParameters();
      console.log('QueryBuilder SQL:', sql);
      console.log('QueryBuilder Params:', params);
      
      const [data, total] = await Promise.all([
        queryBuilder.getMany(),
        countQuery.getCount(),
      ]);

      const totalPages = total > 0 ? Math.ceil(total / validPageSize) : 0;

      console.log('AdminService.getAllItems - Result (with search):', {
        page: validPage,
        pageSize: validPageSize,
        skip,
        total,
        totalPages,
        dataCount: data.length,
        firstItemId: data.length > 0 ? data[0].id : null,
        lastItemId: data.length > 0 ? data[data.length - 1].id : null,
      });

      return {
        data,
        total,
        page: validPage,
        pageSize: validPageSize,
        totalPages,
      };
    }

    // Không có search, dùng findAndCount giống getAllUsers
    console.log('Using findAndCount without search. Options:', JSON.stringify(findOptions, null, 2));
    
    const [data, total] = await this.itemRepository.findAndCount(findOptions);

    const totalPages = total > 0 ? Math.ceil(total / validPageSize) : 0;

    console.log('AdminService.getAllItems - Result (without search):', {
      page: validPage,
      pageSize: validPageSize,
      skip,
      total,
      totalPages,
      dataCount: data.length,
      firstItemId: data.length > 0 ? data[0].id : null,
      lastItemId: data.length > 0 ? data[data.length - 1].id : null,
    });

    return {
      data,
      total,
      page: validPage,
      pageSize: validPageSize,
      totalPages,
    };
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
  async getAllNPCs(page: number = 1, pageSize: number = 20): Promise<{
    data: NPC[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * pageSize;
    const [data, total] = await this.npcRepository.findAndCount({
      relations: ['quests'],
      skip,
      take: pageSize,
      order: { id: 'ASC' },
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
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
  async getAllQuests(page: number = 1, pageSize: number = 20): Promise<{
    data: Quest[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * pageSize;
    const [data, total] = await this.questRepository.findAndCount({
      relations: ['npc'],
      skip,
      take: pageSize,
      order: { id: 'ASC' },
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
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
