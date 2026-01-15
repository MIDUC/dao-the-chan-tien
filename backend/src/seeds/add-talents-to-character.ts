import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getDataSourceOptions } from '../config/database.config';
import { Talent } from '../entities/talent.entity';
import { CharacterTalent } from '../entities/character-talent.entity';
import { Character } from '../entities/character.entity';

/**
 * Add talents to a specific character
 */
async function addTalentsToCharacter(characterId: number, talentCodes: string[]) {
  const dataSource = new DataSource(getDataSourceOptions());

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const talentRepo = dataSource.getRepository(Talent);
    const characterTalentRepo = dataSource.getRepository(CharacterTalent);
    const characterRepo = dataSource.getRepository(Character);

    // Check if character exists
    const character = await characterRepo.findOne({ where: { id: characterId } });
    if (!character) {
      console.error(`❌ Character with ID ${characterId} not found`);
      return;
    }

    console.log(`\n🎯 Adding talents to character: "${character.display_name}" (ID: ${characterId})`);

    // Get talents by codes
    const talents = await talentRepo.find({
      where: talentCodes.map(code => ({ code })),
    });

    if (talents.length === 0) {
      console.error('❌ No talents found with the provided codes');
      return;
    }

    let addedCount = 0;
    for (const talent of talents) {
      const existing = await characterTalentRepo.findOne({
        where: {
          character_id: characterId,
          talent_id: talent.id,
        },
      });

      if (existing) {
        console.log(`  ⏭️  Talent "${talent.name}" already exists, skipping`);
        continue;
      }

      await characterTalentRepo.save({
        character_id: characterId,
        talent_id: talent.id,
        obtained_at: new Date(),
        obtained_from: 'manual_add',
      });

      console.log(`  ✅ Added talent: ${talent.name} (${talent.grade})`);
      addedCount++;
    }

    console.log(`\n✅ Successfully added ${addedCount} talents to character`);
  } catch (error) {
    console.error('❌ Error adding talents:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  // Add 2 more talents to character ID 1
  // You can change the talent codes here
  const characterId = 1;
  const talentCodes = ['linh_can_thien_pham', 'thanh_long_huyet']; // 2 thiên phú bổ sung

  addTalentsToCharacter(characterId, talentCodes)
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { addTalentsToCharacter };

