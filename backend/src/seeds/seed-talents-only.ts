import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getDataSourceOptions } from '../config/database.config';
import { seedTalents } from './talents.seed';
import { Talent } from '../entities/talent.entity';
import { CharacterTalent } from '../entities/character-talent.entity';
import { Character } from '../entities/character.entity';

/**
 * Seed talents and add to first character for testing
 */
async function seedTalentsOnly() {
  const dataSource = new DataSource(getDataSourceOptions());

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Seed talents
    await seedTalents();

    // Add talents to first character for testing
    const talentRepo = dataSource.getRepository(Talent);
    const characterTalentRepo = dataSource.getRepository(CharacterTalent);
    const characterRepo = dataSource.getRepository(Character);

    // Get all talents
    const allTalents = await talentRepo.find();
    console.log(`\n📋 Found ${allTalents.length} talents`);

    // Get first character
    const characters = await characterRepo.find({ take: 1 });
    if (characters.length === 0) {
      console.log('⚠️  No characters found. Please run full seed first.');
      return;
    }

    const testCharacter = characters[0];
    console.log(`\n🎯 Adding talents to character: "${testCharacter.display_name}" (ID: ${testCharacter.id})`);

    // Add first 3 talents (starter talents) to test character
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

      await characterTalentRepo.save({
        character_id: testCharacter.id,
        talent_id: talent.id,
        obtained_at: new Date(),
        obtained_from: 'seed_test',
      });

      console.log(`  ✅ Added talent: ${talent.name} (${talent.grade})`);
    }

    console.log(`\n✅ Successfully added ${talentsToAdd.length} talents to character for testing`);
    console.log('\n💡 You can now test the talents view in the frontend!');
  } catch (error) {
    console.error('❌ Error seeding talents:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  seedTalentsOnly()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { seedTalentsOnly };

