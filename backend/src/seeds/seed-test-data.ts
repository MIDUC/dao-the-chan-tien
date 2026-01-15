import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getDataSourceOptions } from '../config/database.config';
import { seedSkills } from './skills.seed';
import { seedTalents } from './talents.seed';
import { Character } from '../entities/character.entity';
import { Item, ItemType, ItemRarity } from '../entities/item.entity';
import { Inventory } from '../entities/inventory.entity';
import { CharacterElement, ElementType, ElementGrade } from '../entities/character-element.entity';
import { CharacterSkill } from '../entities/character-skill.entity';
import { Skill } from '../entities/skill.entity';
import { CharacterTalent } from '../entities/character-talent.entity';
import { Talent } from '../entities/talent.entity';
import { addItemToInventory } from '../utils/inventory.util';

/**
 * Seed all test data: skills, talents, elements, items, etc.
 */
async function seedTestData() {
  const dataSource = new DataSource(getDataSourceOptions());
  await dataSource.initialize();

  try {
    console.log('🌱 Starting test data seeding...\n');

    // Repositories
    const characterRepo = dataSource.getRepository(Character);
    const itemRepo = dataSource.getRepository(Item);
    const inventoryRepo = dataSource.getRepository(Inventory);
    const elementRepo = dataSource.getRepository(CharacterElement);
    const skillRepo = dataSource.getRepository(Skill);
    const characterSkillRepo = dataSource.getRepository(CharacterSkill);
    const talentRepo = dataSource.getRepository(Talent);
    const characterTalentRepo = dataSource.getRepository(CharacterTalent);

    // Get first character
    const characters = await characterRepo.find({ take: 1 });
    if (characters.length === 0) {
      console.error('❌ No characters found. Please run full seed first.');
      return;
    }

    const testCharacter = characters[0];
    console.log(`🎯 Using character: "${testCharacter.display_name}" (ID: ${testCharacter.id})\n`);

    // 1. Seed Skills
    console.log('📚 Seeding Skills...');
    await seedSkills();
    console.log('✅ Skills seeded\n');

    // 2. Seed Talents
    console.log('✨ Seeding Talents...');
    await seedTalents();
    console.log('✅ Talents seeded\n');

    // 3. Add Element Items to Inventory
    console.log('💎 Adding Element Items to Inventory...');
    
    // Find or create element items
    const elementItemsData: Array<{
      name: string;
      element: ('bang' | 'hoa' | 'thuy' | 'kim' | 'moc')[];
      rarity: ItemRarity;
      category: string;
    }> = [
      { name: 'Đá Thuộc Tính Băng', element: ['bang'], rarity: ItemRarity.UNCOMMON, category: 'material_ice_uncommon' },
      { name: 'Đá Thuộc Tính Hỏa', element: ['hoa'], rarity: ItemRarity.UNCOMMON, category: 'material_fire_uncommon' },
      { name: 'Đá Thuộc Tính Thủy', element: ['thuy'], rarity: ItemRarity.UNCOMMON, category: 'material_water_uncommon' },
      { name: 'Đá Thuộc Tính Kim', element: ['kim'], rarity: ItemRarity.RARE, category: 'material_metal_rare' },
      { name: 'Đá Thuộc Tính Mộc', element: ['moc'], rarity: ItemRarity.UNCOMMON, category: 'material_wood_uncommon' },
    ];

    for (const itemData of elementItemsData) {
      // Try to find existing item by name or category
      let item = await itemRepo.findOne({
        where: [
          { name: itemData.name },
          { category: itemData.category },
        ],
      });

      if (!item) {
        // Create new item
        item = itemRepo.create({
          name: itemData.name,
          description: `Đá nguyên tố ${itemData.element[0]}, nguyên liệu luyện đan`,
          item_type: ItemType.MATERIAL,
          category: itemData.category,
          rarity: itemData.rarity,
          element: itemData.element as any,
          max_stack: 999,
          sellable: true,
          sell_price: 10,
          usable: false,
          is_active: true,
        });
        item = await itemRepo.save(item);
        console.log(`  ✅ Created item: ${item.name}`);
      } else {
        // Update element if missing
        if (!item.element || !Array.isArray(item.element)) {
          item.element = itemData.element as any;
          item = await itemRepo.save(item);
          console.log(`  🔄 Updated item element: ${item.name}`);
        } else {
          console.log(`  ⏭️  Item already exists: ${item.name}`);
        }
      }

      // Add to inventory
      await addItemToInventory(inventoryRepo, testCharacter.id, item, 5);
      console.log(`  ✅ Added 5x ${item.name} to inventory`);
    }
    console.log('✅ Element items added to inventory\n');

    // 4. Create Character Elements
    console.log('🌊 Creating Character Elements...');
    const elementsToCreate = [
      { type: ElementType.BANG, grade: ElementGrade.TOT, level: 5 },
      { type: ElementType.HOA, grade: ElementGrade.HIEM, level: 3 },
      { type: ElementType.THUY, grade: ElementGrade.TOT, level: 2 },
      { type: ElementType.KIM, grade: ElementGrade.PHAM, level: 1 },
    ];

    for (const elemData of elementsToCreate) {
      const existing = await elementRepo.findOne({
        where: {
          character_id: testCharacter.id,
          element_type: elemData.type,
        },
      });

      if (existing) {
        console.log(`  ⏭️  Element ${elemData.type} already exists, skipping`);
        continue;
      }

      const element = elementRepo.create({
        character_id: testCharacter.id,
        element_type: elemData.type,
        grade: elemData.grade,
        level: elemData.level,
        exp: 0,
      });
      await elementRepo.save(element);
      console.log(`  ✅ Created element: ${elemData.type} (${elemData.grade}, level ${elemData.level})`);
    }
    console.log('✅ Character elements created\n');

    // 5. Add Skills to Character
    console.log('⚔️ Adding Skills to Character...');
    const allSkills = await skillRepo.find();
    const skillsToLearn = allSkills.slice(0, 3); // First 3 skills

    for (const skill of skillsToLearn) {
      const existing = await characterSkillRepo.findOne({
        where: {
          character_id: testCharacter.id,
          skill_id: skill.id,
        },
      });

      if (existing) {
        console.log(`  ⏭️  Skill "${skill.name}" already learned, skipping`);
        continue;
      }

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
    console.log('✅ Skills added to character\n');

    // 6. Add Talents to Character (if not already added)
    console.log('✨ Adding Talents to Character...');
    const allTalents = await talentRepo.find({ where: { is_starter: true } });
    const talentsToAdd = allTalents.slice(0, 3);

    for (const talent of talentsToAdd) {
      const existing = await characterTalentRepo.findOne({
        where: {
          character_id: testCharacter.id,
          talent_id: talent.id,
        },
      });

      if (existing) {
        console.log(`  ⏭️  Talent "${talent.name}" already exists, skipping`);
        continue;
      }

      const characterTalent = characterTalentRepo.create({
        character_id: testCharacter.id,
        talent_id: talent.id,
        obtained_at: new Date(),
        obtained_from: 'seed_test',
      });
      await characterTalentRepo.save(characterTalent);
      console.log(`  ✅ Added talent: ${talent.name}`);
    }
    console.log('✅ Talents added to character\n');

    console.log('🎉 Test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Character: ${testCharacter.display_name} (ID: ${testCharacter.id})`);
    console.log(`   - Element Items in Inventory: ${elementItemsData.length} types`);
    console.log(`   - Character Elements: ${elementsToCreate.length}`);
    console.log(`   - Learned Skills: ${skillsToLearn.length}`);
    console.log(`   - Talents: ${talentsToAdd.length}`);
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { seedTestData };

