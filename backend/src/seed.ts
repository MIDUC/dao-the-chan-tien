import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { getDataSourceOptions } from './config/database.config';
import { User } from './entities/user.entity';
import { Character } from './entities/character.entity';
import { NPC } from './entities/npc.entity';
import { Quest, QuestType } from './entities/quest.entity';
import { CharacterQuest } from './entities/character-quest.entity';
import { Role } from './entities/role.entity';
import { Item } from './entities/item.entity';
import { ItemEffect } from './entities/item-effect.entity';
import { Inventory } from './entities/inventory.entity';
import { Equipment } from './entities/equipment.entity';
import { SystemConfig } from './entities/system-config.entity';
import { StatusLog, StatusLogType } from './entities/status-log.entity';
import { RealmLevel, RealmRequirement } from './entities/realm-level.entity';
import { Currency, CurrencyType } from './entities/currency.entity';
import { Shop } from './entities/shop.entity';
import { ShopItem } from './entities/shop-item.entity';
import { formatRealm } from './utils/realm.util';
import { seedItems } from './seeds/items.seed';
import { seedEquipment } from './seeds/equipment.seed';
import { seedShops } from './seeds/shops.seed';
import { seedQiEffects } from './seeds/qi-effects.seed';
import { seedAncientArtifacts } from './seeds/ancient-artifacts.seed';
import { seedTalents } from './seeds/talents.seed';
import { seedSkills } from './seeds/skills.seed';
import { addItemToInventory } from './utils/inventory.util';
import { QiEffect } from './entities/qi.entity';
import { Talent } from './entities/talent.entity';
import { CharacterTalent } from './entities/character-talent.entity';
import { CharacterElement, ElementType, ElementGrade } from './entities/character-element.entity';
import { CharacterSkill } from './entities/character-skill.entity';
import { Skill } from './entities/skill.entity';
import { ItemType, ItemRarity } from './entities/item.entity';

async function seed() {
  const dataSource = new DataSource(getDataSourceOptions());

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const userRepo = dataSource.getRepository(User);
    const characterRepo = dataSource.getRepository(Character);
    const npcRepo = dataSource.getRepository(NPC);
    const questRepo = dataSource.getRepository(Quest);
    const characterQuestRepo = dataSource.getRepository(CharacterQuest);
    const roleRepo = dataSource.getRepository(Role);
    const itemRepo = dataSource.getRepository(Item);
    const itemEffectRepo = dataSource.getRepository(ItemEffect);
    const inventoryRepo = dataSource.getRepository(Inventory);
    const equipmentRepo = dataSource.getRepository(Equipment);
    const systemConfigRepo = dataSource.getRepository(SystemConfig);
    const statusLogRepo = dataSource.getRepository(StatusLog);
    const realmLevelRepo = dataSource.getRepository(RealmLevel);
    const currencyRepo = dataSource.getRepository(Currency);
    const shopRepo = dataSource.getRepository(Shop);
    const shopItemRepo = dataSource.getRepository(ShopItem);
    const qiEffectRepo = dataSource.getRepository(QiEffect);

    // Clear existing data
    // MySQL doesn't allow TRUNCATE with foreign keys, so we use DELETE
    // Temporarily disable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // Clear in order (child tables first)
    await dataSource.query('DELETE FROM character_progressions');
    await dataSource.query('DELETE FROM realm_levels');
    await dataSource.query('DELETE FROM status_logs');
    await dataSource.query('DELETE FROM battle_logs');
    await dataSource.query('DELETE FROM guild_members');
    await dataSource.query('DELETE FROM guilds');
    await dataSource.query('DELETE FROM notifications');
    await dataSource.query('DELETE FROM friends');
    await dataSource.query('DELETE FROM leaderboards');
    await dataSource.query('DELETE FROM character_skills');
    await dataSource.query('DELETE FROM skills');
    await dataSource.query('DELETE FROM transactions');
    await dataSource.query('DELETE FROM shop_items');
    await dataSource.query('DELETE FROM shops');
    await dataSource.query('DELETE FROM character_achievements');
    await dataSource.query('DELETE FROM achievements');
    await dataSource.query('DELETE FROM currency');
    await dataSource.query('DELETE FROM system_config');
    await dataSource.query('DELETE FROM character_qi');
    await qiEffectRepo.clear();
    await equipmentRepo.clear();
    await inventoryRepo.clear();
    await itemEffectRepo.clear();
    await itemRepo.clear();
    await characterQuestRepo.clear();
    await questRepo.clear();
    await characterRepo.clear();
    await npcRepo.clear();
    await userRepo.clear();
    await roleRepo.clear();

    // Re-enable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🧹 Cleared existing data');

    // Create Users
    // Hash passwords for real authentication
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const userPasswordHash = await bcrypt.hash('user123', 10);

    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password_hash: adminPasswordHash,
      },
      {
        username: 'dao_hieu_1',
        email: 'daohieu1@example.com',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password_hash: userPasswordHash,
      },
      {
        username: 'tien_nhan_2',
        email: 'tiennhan2@example.com',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password_hash: userPasswordHash,
      },
    ];

    const savedUsers = await userRepo.save(users);
    console.log(`✅ Created ${savedUsers.length} users`);

    // Create Roles
    const roles = [
      {
        name: 'admin',
        description: 'Quản trị viên hệ thống, có toàn quyền',
        priority: 100,
      },
      {
        name: 'moderator',
        description: 'Điều hành viên, quản lý người chơi và nội dung',
        priority: 50,
      },
      {
        name: 'player',
        description: 'Người chơi thông thường',
        priority: 1,
      },
      {
        name: 'vip',
        description: 'Người chơi VIP, có quyền lợi đặc biệt',
        priority: 10,
      },
    ];

    const savedRoles = await roleRepo.save(roles);
    console.log(`✅ Created ${savedRoles.length} roles`);

    // Assign roles to users
    // User 0 (admin): admin + player
    savedUsers[0].roles = [
      savedRoles.find((r) => r.name === 'admin')!,
      savedRoles.find((r) => r.name === 'player')!,
    ];
    await userRepo.save(savedUsers[0]);

    // User 1: player
    savedUsers[1].roles = [savedRoles.find((r) => r.name === 'player')!];
    await userRepo.save(savedUsers[1]);

    // User 2: player + vip
    savedUsers[2].roles = [
      savedRoles.find((r) => r.name === 'player')!,
      savedRoles.find((r) => r.name === 'vip')!,
    ];
    await userRepo.save(savedUsers[2]);

    console.log('✅ Assigned roles to users');

    // Create Characters (1 user = 1 character)
    const characterNow = new Date();
    const characters = [
      {
        user_id: savedUsers[0].id, // admin
        display_name: 'Thiên Đạo',
        realm_level: 99, // Độ Kiếp Tầng 9
        exp: 50,
        base_exp_per_interval: 100, // Base EXP mỗi lần cộng
        // Primary Stats
        luc_dao: 15,
        can_cot: 12,
        than_phap: 12,
        ngo_tinh: 18,
        dinh_luc: 10,
        // Hidden Stats
        linh_can: 'moc' as const, // Wood element
        phuc_duyen: 50,
        tam_canh: 50,
        // Legacy stats
        strength: 15,
        agility: 12,
        wisdom: 18,
        last_login_at: characterNow, // Set để có thể nhận EXP tự động
      },
      {
        user_id: savedUsers[1].id, // dao_hieu_1
        display_name: 'Băng Tuyết Tiên Tử',
        realm_level: 8, // Luyện Khí Tầng 8
        exp: 120,
        base_exp_per_interval: 12, // Base EXP mỗi lần cộng
        // Primary Stats
        luc_dao: 10,
        can_cot: 14,
        than_phap: 16,
        ngo_tinh: 20,
        dinh_luc: 12,
        // Hidden Stats
        linh_can: 'thuy' as const, // Water element
        phuc_duyen: 55,
        tam_canh: 60,
        // Legacy stats
        strength: 10,
        agility: 16,
        wisdom: 20,
        last_login_at: characterNow, // Set để có thể nhận EXP tự động
      },
      {
        user_id: savedUsers[2].id, // tien_nhan_2
        display_name: 'Huyền Hỏa Chân Nhân',
        realm_level: 14, // Trúc Cơ Tầng 4
        exp: 350,
        base_exp_per_interval: 55, // Đã độ kiếp Trúc Cơ, được random thêm 40-60
        // Primary Stats
        luc_dao: 25,
        can_cot: 22,
        than_phap: 20,
        ngo_tinh: 22,
        dinh_luc: 18,
        // Hidden Stats
        linh_can: 'hoa' as const, // Fire element
        phuc_duyen: 60,
        tam_canh: 45,
        // Legacy stats (for backward compatibility)
        strength: 25,
        agility: 20,
        wisdom: 22,
        last_login_at: characterNow, // Set để có thể nhận EXP tự động
      },
    ];

    const savedCharacters = await characterRepo.save(characters);
    console.log(`✅ Created ${savedCharacters.length} characters`);

    // Initialize currencies for all characters
    for (const character of savedCharacters) {
      for (const currencyType of Object.values(CurrencyType)) {
        const existing = await currencyRepo.findOne({
          where: {
            character_id: character.id,
            currency_type: currencyType,
          },
        });
        if (!existing) {
          await currencyRepo.save({
            character_id: character.id,
            currency_type: currencyType,
            amount: 0,
          });
        }
      }
    }
    console.log(
      `✅ Initialized currencies for ${savedCharacters.length} characters`,
    );

    // Create NPCs
    const npcs = [
      {
        name: 'Lão Đạo Sư',
        description:
          'Một lão đạo sư uyên bác, thường xuất hiện vào buổi sáng để giao nhiệm vụ tu luyện thể chất.',
        is_active: true,
        spawn_time_start: '06:00:00',
        spawn_time_end: '12:00:00',
      },
      {
        name: 'Tiên Nữ Vân Hoa',
        description:
          'Tiên nữ xinh đẹp chuyên về tu luyện tinh thần và thiền định.',
        is_active: true,
        spawn_time_start: '14:00:00',
        spawn_time_end: '20:00:00',
      },
      {
        name: 'Kiếm Tiên Vô Danh',
        description:
          'Một kiếm tiên ẩn danh, xuất hiện bất kỳ lúc nào để thử thách người chơi.',
        is_active: true,
      },
    ];

    const savedNpcs = await npcRepo.save(npcs);
    console.log(`✅ Created ${savedNpcs.length} NPCs`);

    // Create Quests
    const quests = [
      // Quests từ Lão Đạo Sư
      {
        npc_id: savedNpcs[0].id,
        title: 'Luyện Thể: Chống Đẩy Cơ Bản',
        description:
          'Hoàn thành 10 lần chống đẩy để tăng cường thể phách. Đây là bước đầu tiên trên con đường tu tiên.',
        quest_type: QuestType.PUSH_UP,
        requirements: {
          min: 10,
          max: 50,
          target: 10,
          unit: 'lần',
        },
        reward: {
          exp: 100,
          spirit: 5,
        },
        deadline_hours: 24,
        is_active: true,
      },
      {
        npc_id: savedNpcs[0].id,
        title: 'Luyện Thể: Chạy Bộ Tu Luyện',
        description:
          'Chạy bộ ít nhất 2km để rèn luyện thân pháp và tăng tốc độ di chuyển.',
        quest_type: QuestType.RUNNING,
        requirements: {
          min: 2,
          max: 10,
          target: 2,
          unit: 'km',
        },
        reward: {
          exp: 150,
          spirit: 8,
        },
        deadline_hours: 48,
        is_active: true,
      },
      // Quests từ Tiên Nữ Vân Hoa
      {
        npc_id: savedNpcs[1].id,
        title: 'Tu Tâm: Thiền Định 15 Phút',
        description:
          'Ngồi thiền 15 phút để tĩnh tâm, tăng cường tâm cảnh và linh lực.',
        quest_type: QuestType.MEDITATION,
        requirements: {
          min: 15,
          max: 60,
          target: 15,
          unit: 'phút',
        },
        reward: {
          exp: 120,
          spirit: 10,
        },
        deadline_hours: 12,
        is_active: true,
      },
      {
        npc_id: savedNpcs[1].id,
        title: 'Tu Tâm: Thiền Định Nâng Cao',
        description:
          'Thiền định 30 phút để đạt đến trạng thái tâm cảnh cao hơn.',
        quest_type: QuestType.MEDITATION,
        requirements: {
          min: 30,
          max: 120,
          target: 30,
          unit: 'phút',
        },
        reward: {
          exp: 250,
          spirit: 20,
        },
        deadline_hours: 24,
        is_active: true,
      },
      // Quests từ Kiếm Tiên Vô Danh
      {
        npc_id: savedNpcs[2].id,
        title: 'Thử Thách: Chống Đẩy Khó',
        description:
          'Hoàn thành 30 lần chống đẩy để chứng minh thể phách mạnh mẽ.',
        quest_type: QuestType.PUSH_UP,
        requirements: {
          min: 30,
          max: 100,
          target: 30,
          unit: 'lần',
        },
        reward: {
          exp: 300,
          spirit: 15,
        },
        deadline_hours: 36,
        is_active: true,
      },
      {
        npc_id: savedNpcs[2].id,
        title: 'Thử Thách: Chạy Bộ Dài',
        description: 'Chạy bộ 5km để rèn luyện sức bền và thân pháp siêu việt.',
        quest_type: QuestType.RUNNING,
        requirements: {
          min: 5,
          max: 20,
          target: 5,
          unit: 'km',
        },
        reward: {
          exp: 400,
          spirit: 25,
        },
        deadline_hours: 72,
        is_active: true,
      },
    ];

    const savedQuests = await questRepo.save(quests);
    console.log(`✅ Created ${savedQuests.length} quests`);

    // Create Materials/Consumables with all rarity levels
    const savedItems = await seedItems(itemRepo);

    // Create Equipment items (hundreds of equipment)
    console.log('\n⚔️ Seeding Equipment...');
    const savedEquipment = await seedEquipment(itemRepo);

    // Combine all items
    const allItems = [...savedItems, ...savedEquipment];

    // Create Shops and Shop Items
    console.log('\n🏪 Seeding Shops...');
    const { shops: savedShops, shopItems: savedShopItems } = await seedShops(
      shopRepo,
      shopItemRepo,
      allItems,
    );

    // Create Item Effects (skip for now, can add later if needed)
    const itemEffects: any[] = [];
    // Add effects for consumables if needed
    // const consumableItems = savedItems.filter(item => item.item_type === ItemType.CONSUMABLE);
    // ... add effects here

    if (itemEffects.length > 0) {
      await itemEffectRepo.save(itemEffects);
      console.log(`✅ Created ${itemEffects.length} item effects`);
    }

    // Add sample items to character inventory (one of each rarity for testing)
    let inventoryCount = 0;
    if (allItems.length > 0) {
      // Add equipment items (Mộc Kiếm) - each will have random stats
      const mocKiemItems = allItems.filter((item) =>
        item.name.includes('Mộc Kiếm'),
      );

      if (savedCharacters[0]?.id) {
        for (const item of mocKiemItems) {
          await addItemToInventory(inventoryRepo, savedCharacters[0].id, item, 1);
          inventoryCount++;
        }
      }

      // Add some materials (Đá Thuộc Tính) - these will stack
      const daThuocTinhItems = allItems.filter((item) =>
        item.name.includes('Đá Thuộc Tính'),
      );

      if (daThuocTinhItems.length > 0 && savedCharacters[0]?.id) {
        // Add first material type with quantity 10
        await addItemToInventory(
          inventoryRepo,
          savedCharacters[0].id,
          daThuocTinhItems[0],
          10,
        );
        inventoryCount++;
      }

      console.log(
        `✅ Created ${inventoryCount} sample inventory items for character`,
      );
    }

    // Equip items (skip for now, can add later)
    const equipments: any[] = [];
    // const weaponItems = savedItems.filter(item =>
    //   item.item_type === ItemType.EQUIPMENT && item.equipment_slot === EquipmentSlot.WEAPON
    // );
    // ... add equipment here

    await equipmentRepo.save(equipments);
    console.log(`✅ Created ${equipments.length} equipment slots`);

    // ========== SYSTEM CONFIGS ==========
    console.log('\n📝 Seeding System Configs...');
    const defaultConfigs = [
      {
        key: 'cultivation_interval_seconds',
        value: '60',
        description:
          'Thời gian (giây) giữa mỗi lần cộng EXP tự động. Mặc định: 60 giây (1 phút)',
        is_active: true,
      },
      {
        key: 'base_exp_rate',
        value: '10',
        description:
          'EXP cơ bản mỗi giờ. Mặc định: 10 EXP/giờ. EXP rate sẽ tăng theo realm level và các multipliers',
        is_active: true,
      },
    ];

    const savedConfigs: SystemConfig[] = [];
    for (const configData of defaultConfigs) {
      const existing = await systemConfigRepo.findOne({
        where: { key: configData.key },
      });
      if (!existing) {
        const config = systemConfigRepo.create(configData);
        const saved = await systemConfigRepo.save(config);
        savedConfigs.push(saved);
        console.log(
          `   ✅ Created config: ${configData.key} = ${configData.value}`,
        );
      } else {
        console.log(`   ⏭️  Config already exists: ${configData.key}`);
        savedConfigs.push(existing);
      }
    }

    // ========== STATUS LOGS ==========
    console.log('\n📝 Seeding Status Logs...');
    const now = new Date();
    const statusLogs = [
      // Public logs (no character_id, party_id, guild_id)
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Linh khí dao động, linh thạch kết tụ dưới chân người.',
        created_at: new Date(now.getTime() - 5 * 60000), // 5 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message:
          'Thiên địa linh khí hội tụ, cảm nhận được sự biến đổi của vũ trụ.',
        created_at: new Date(now.getTime() - 10 * 60000), // 10 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THU_HOACH,
        message: '+10 linh thạch từ thiên địa linh khí.',
        created_at: new Date(now.getTime() - 15 * 60000), // 15 minutes ago
      },
      // Character 1 logs (Linh Vân Tử)
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 5 sinh lực.',
        created_at: new Date(now.getTime() - 2 * 60000), // 2 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Gặp được một đạo hữu trên đường tu hành.',
        created_at: new Date(now.getTime() - 8 * 60000), // 8 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message: 'Tu vi tăng lên, cảm nhận được sự biến đổi của thiên địa.',
        created_at: new Date(now.getTime() - 20 * 60000), // 20 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THU_HOACH,
        message: '+4 linh thạch từ tu luyện.',
        created_at: new Date(now.getTime() - 25 * 60000), // 25 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 3 sinh lực.',
        created_at: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
      },
      // Character 2 logs (Băng Tuyết Tiên Tử)
      {
        character_id: savedCharacters[1].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message:
          'Linh khí băng tuyết kết tụ, cảm nhận được hàn khí trong không khí.',
        created_at: new Date(now.getTime() - 3 * 60000), // 3 minutes ago
      },
      {
        character_id: savedCharacters[1].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message: 'Tu vi băng tuyết đạt đến cảnh giới mới, linh lực tăng mạnh.',
        created_at: new Date(now.getTime() - 12 * 60000), // 12 minutes ago
      },
      {
        character_id: savedCharacters[1].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THU_HOACH,
        message: '+8 linh thạch từ băng tuyết linh khí.',
        created_at: new Date(now.getTime() - 18 * 60000), // 18 minutes ago
      },
      {
        character_id: savedCharacters[1].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 6 sinh lực.',
        created_at: new Date(now.getTime() - 22 * 60000), // 22 minutes ago
      },
      {
        character_id: savedCharacters[1].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 4 sinh lực.',
        created_at: new Date(now.getTime() - 28 * 60000), // 28 minutes ago
      },
      // Character 3 logs (Huyền Hỏa Chân Nhân)
      {
        character_id: savedCharacters[2].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Hỏa linh khí bùng nổ, cảm nhận được sức mạnh hỏa nguyên.',
        created_at: new Date(now.getTime() - 1 * 60000), // 1 minute ago
      },
      {
        character_id: savedCharacters[2].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message:
          'Tu vi hỏa nguyên đạt đến đỉnh cao, linh lực hỏa tính tăng vọt.',
        created_at: new Date(now.getTime() - 6 * 60000), // 6 minutes ago
      },
      {
        character_id: savedCharacters[2].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THU_HOACH,
        message: '+15 linh thạch từ hỏa linh khí.',
        created_at: new Date(now.getTime() - 11 * 60000), // 11 minutes ago
      },
      {
        character_id: savedCharacters[2].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 8 sinh lực.',
        created_at: new Date(now.getTime() - 16 * 60000), // 16 minutes ago
      },
      {
        character_id: savedCharacters[2].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 7 sinh lực.',
        created_at: new Date(now.getTime() - 24 * 60000), // 24 minutes ago
      },
      {
        character_id: savedCharacters[2].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Gặp được một đạo hữu hỏa tính trên đường tu hành.',
        created_at: new Date(now.getTime() - 32 * 60000), // 32 minutes ago
      },
      // More public logs
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 2 sinh lực.',
        created_at: new Date(now.getTime() - 7 * 60000), // 7 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 2 sinh lực.',
        created_at: new Date(now.getTime() - 13 * 60000), // 13 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 2 sinh lực.',
        created_at: new Date(now.getTime() - 19 * 60000), // 19 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 2 sinh lực.',
        created_at: new Date(now.getTime() - 26 * 60000), // 26 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 2 sinh lực.',
        created_at: new Date(now.getTime() - 33 * 60000), // 33 minutes ago
      },
      // More fake logs for testing
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Phát hiện một động phủ cổ xưa ẩn trong núi sâu.',
        created_at: new Date(now.getTime() - 40 * 60000), // 40 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message: 'Đột phá cảnh giới! Đạt đến Luyện Khí Tầng 10.',
        created_at: new Date(now.getTime() - 45 * 60000), // 45 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THU_HOACH,
        message: '+20 linh thạch từ việc khám phá động phủ.',
        created_at: new Date(now.getTime() - 50 * 60000), // 50 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Gặp được một lão tiên nhân, được chỉ điểm về đạo pháp.',
        created_at: new Date(now.getTime() - 55 * 60000), // 55 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message: 'Ngộ ra được một chân lý mới về tu luyện.',
        created_at: new Date(now.getTime() - 60 * 60000), // 1 hour ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 10 sinh lực.',
        created_at: new Date(now.getTime() - 65 * 60000), // 65 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THU_HOACH,
        message: '+12 linh thạch từ việc tu luyện trong động phủ.',
        created_at: new Date(now.getTime() - 70 * 60000), // 70 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Phát hiện một linh thảo quý hiếm trong rừng sâu.',
        created_at: new Date(now.getTime() - 75 * 60000), // 75 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message: 'Cảm nhận được sự dao động của thiên địa linh khí.',
        created_at: new Date(now.getTime() - 80 * 60000), // 80 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THU_HOACH,
        message: '+6 linh thạch từ việc hái linh thảo.',
        created_at: new Date(now.getTime() - 85 * 60000), // 85 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 5 sinh lực.',
        created_at: new Date(now.getTime() - 90 * 60000), // 90 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Tham gia một cuộc đấu pháp với đạo hữu khác.',
        created_at: new Date(now.getTime() - 95 * 60000), // 95 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message: 'Tu vi tăng lên sau khi đấu pháp, hiểu thêm về chiến đấu.',
        created_at: new Date(now.getTime() - 100 * 60000), // 100 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THU_HOACH,
        message: '+18 linh thạch từ phần thưởng đấu pháp.',
        created_at: new Date(now.getTime() - 105 * 60000), // 105 minutes ago
      },
      {
        character_id: savedCharacters[0].id,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.HOI_PHUC,
        message:
          'Thiên địa linh khí dung nhập vào thể phách, hồi phục 7 sinh lực.',
        created_at: new Date(now.getTime() - 110 * 60000), // 110 minutes ago
      },
      // Public logs
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Thiên tượng biến đổi, linh khí trong thiên địa dâng cao.',
        created_at: new Date(now.getTime() - 35 * 60000), // 35 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message: 'Nhiều đạo hữu cùng cảm nhận được sự biến đổi của thiên địa.',
        created_at: new Date(now.getTime() - 38 * 60000), // 38 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THU_HOACH,
        message: '+5 linh thạch từ thiên địa linh khí dâng cao.',
        created_at: new Date(now.getTime() - 42 * 60000), // 42 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.THE_SU,
        message: 'Một đạo hữu đạt được đột phá cảnh giới lớn.',
        created_at: new Date(now.getTime() - 48 * 60000), // 48 minutes ago
      },
      {
        character_id: undefined,
        party_id: undefined,
        guild_id: undefined,
        type: StatusLogType.TU_VI,
        message: 'Linh khí trong thiên địa trở nên dày đặc hơn.',
        created_at: new Date(now.getTime() - 52 * 60000), // 52 minutes ago
      },
    ];

    const savedStatusLogs = await statusLogRepo.save(statusLogs);
    console.log(`✅ Created ${savedStatusLogs.length} status logs`);

    // ========== REALM LEVELS ==========
    console.log('\n📊 Seeding Realm Levels...');
    const realmLevels: RealmLevel[] = [];

    // Create 100 levels
    // Only levels divisible by 10 (10, 20, 30, ...) require do_kiep
    for (let level = 1; level <= 100; level++) {
      const expRequired = Math.floor(1000 * Math.pow(level, 1.5));

      // Generate name using formatRealm function
      const name = formatRealm(level);

      // Only add do_kiep requirement for levels divisible by 10
      // (9->10, 19->20, 29->30, etc.)
      const requirements: RealmRequirement[] = [];

      if (level % 10 === 0) {
        // Calculate success rate: higher level = lower rate
        // Level 10: 0.7-0.9, Level 100: 0.1-0.3
        const minRate = Math.max(0.1, 0.9 - (level / 10 - 1) * 0.08);
        const maxRate = Math.max(0.3, 0.9 - (level / 10 - 1) * 0.08);

        requirements.push({
          type: 'do_kiep',
          count: 1,
          success_rate: {
            min: minRate,
            max: maxRate,
          },
          description: `Cần vượt qua 1 lần độ kiếp để đột phá lên cấp ${level + 1}`,
        });
      }

      realmLevels.push({
        level,
        name,
        exp_required: expRequired,
        requirements: requirements.length > 0 ? requirements : undefined,
      } as RealmLevel);
    }

    const savedRealmLevels = await realmLevelRepo.save(realmLevels);
    console.log(`✅ Created ${savedRealmLevels.length} realm levels`);

    // ========== QI EFFECTS ==========
    console.log('\n⚡ Seeding Qi Effects...');
    const savedQiEffects = await seedQiEffects(qiEffectRepo);
    console.log(`✅ Created ${savedQiEffects.length} Qi effects`);

    // ========== ANCIENT ARTIFACTS (Cổ Bảo) ==========
    console.log('\n💎 Seeding Ancient Artifacts...');
    await seedAncientArtifacts(dataSource);
    console.log('✅ Ancient Artifacts seeded');

    // ========== SKILLS (Kỹ Năng) ==========
    console.log('\n📚 Seeding Skills...');
    await seedSkills();
    console.log('✅ Skills seeded');

    // ========== TALENTS (Thiên Phú) ==========
    console.log('\n✨ Seeding Talents...');
    await seedTalents();
    console.log('✅ Talents seeded');

    // Add talents to characters for testing
    const talentRepo = dataSource.getRepository(Talent);
    const characterTalentRepo = dataSource.getRepository(CharacterTalent);
    const skillRepo = dataSource.getRepository(Skill);
    const characterSkillRepo = dataSource.getRepository(CharacterSkill);
    const elementRepo = dataSource.getRepository(CharacterElement);
    
    // Get all talents and skills
    const allTalents = await talentRepo.find();
    const allSkills = await skillRepo.find();
    
    // Add some talents, skills, and elements to first character (admin) for testing
    if (savedCharacters.length > 0) {
      const testCharacter = savedCharacters[0]; // Admin character
      
      // Add first 3 talents (starter talents) to test character
      if (allTalents.length > 0) {
        const talentsToAdd = allTalents.slice(0, 3);
        
        for (const talent of talentsToAdd) {
          const existing = await characterTalentRepo.findOne({
            where: {
              character_id: testCharacter.id,
              talent_id: talent.id,
            },
          });
          
          if (!existing) {
            await characterTalentRepo.save({
              character_id: testCharacter.id,
              talent_id: talent.id,
              obtained_at: new Date(),
              obtained_from: 'seed',
            });
            console.log(`  ✅ Added talent: ${talent.name} (${talent.grade})`);
          }
        }
      }

      // Add first 3 skills to test character
      // Note: skillRepo and characterSkillRepo are already declared above
      const allSkills = await skillRepo.find();
      
      if (allSkills.length > 0) {
        const skillsToAdd = allSkills.slice(0, 3);
        
        for (const skill of skillsToAdd) {
          const existing = await characterSkillRepo.findOne({
            where: {
              character_id: testCharacter.id,
              skill_id: skill.id,
            },
          });
          
          if (!existing) {
            const characterSkill = characterSkillRepo.create({
              character_id: testCharacter.id,
              skill_id: skill.id,
              level: 1,
              exp: 0,
              is_unlocked: true,
              learned_at: new Date(),
              unlocked_at: new Date(),
            });
            await characterSkillRepo.save(characterSkill);
            console.log(`  ✅ Learned skill: ${skill.name}`);
          }
        }
      }

      // Create some elements for test character
      const elementRepo = dataSource.getRepository(CharacterElement);
      const elementsToCreate = [
        { type: ElementType.BANG, grade: ElementGrade.TOT, level: 5 },
        { type: ElementType.HOA, grade: ElementGrade.HIEM, level: 3 },
        { type: ElementType.THUY, grade: ElementGrade.TOT, level: 2 },
      ];

      for (const elemData of elementsToCreate) {
        const existing = await elementRepo.findOne({
          where: {
            character_id: testCharacter.id,
            element_type: elemData.type,
          },
        });

        if (!existing) {
          await elementRepo.save({
            character_id: testCharacter.id,
            element_type: elemData.type,
            grade: elemData.grade,
            level: elemData.level,
            exp: 0,
          });
          console.log(`  ✅ Created element: ${elemData.type} (${elemData.grade}, level ${elemData.level})`);
        }
      }

      // Add element items to inventory
      const elementItems = allItems.filter(item => 
        item.item_type === ItemType.MATERIAL && 
        item.element && 
        Array.isArray(item.element) && 
        item.element.length > 0
      );

      if (elementItems.length > 0) {
        // Add first few element items
        for (const item of elementItems.slice(0, 5)) {
          await addItemToInventory(inventoryRepo, testCharacter.id, item, 5);
          console.log(`  ✅ Added 5x ${item.name} to inventory`);
        }
      }
      
      console.log(`✅ Added test data to character "${testCharacter.display_name}"`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${savedUsers.length}`);
    console.log(`   - Roles: ${savedRoles.length}`);
    console.log(`   - Characters: ${savedCharacters.length}`);
    console.log(`   - NPCs: ${savedNpcs.length}`);
    console.log(`   - Quests: ${savedQuests.length}`);
    console.log(`   - Materials/Consumables: ${savedItems.length}`);
    console.log(`   - Equipment: ${savedEquipment.length}`);
    console.log(`   - Total Items: ${allItems.length}`);
    console.log(`   - Item Effects: ${itemEffects.length}`);
    console.log(`   - Sample Inventory Items: ${inventoryCount}`);
    console.log(`   - Equipment: ${equipments.length}`);
    console.log(`   - Shops: ${savedShops.length}`);
    console.log(`   - Shop Items: ${savedShopItems.length}`);
    console.log(`   - System Configs: ${savedConfigs.length}`);
    console.log(`   - Status Logs: ${savedStatusLogs.length}`);
    console.log(`   - Realm Levels: ${savedRealmLevels.length}`);
    console.log(`   - Qi Effects: ${savedQiEffects.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

void seed();
