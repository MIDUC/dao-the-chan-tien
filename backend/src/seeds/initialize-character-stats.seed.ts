import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getDataSourceOptions } from '../config/database.config';
import { Character } from '../entities/character.entity';
import { CharacterElement, ElementType, ElementGrade } from '../entities/character-element.entity';
import { CharacterQi, QiType } from '../entities/qi.entity';

/**
 * Initialize all elements and Qi for all existing characters
 * This ensures all characters have complete stats for display
 */
async function initializeCharacterStats() {
  const dataSource = new DataSource(getDataSourceOptions());

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const characterRepo = dataSource.getRepository(Character);
    const elementRepo = dataSource.getRepository(CharacterElement);
    const qiRepo = dataSource.getRepository(CharacterQi);

    // Get all characters
    const characters = await characterRepo.find();
    console.log(`\n📋 Found ${characters.length} characters\n`);

    if (characters.length === 0) {
      console.log('⚠️  No characters found. Nothing to initialize.');
      return;
    }

    // Initialize for each character
    for (const character of characters) {
      console.log(`🎯 Initializing stats for: "${character.display_name}" (ID: ${character.id})`);

      // Initialize all elements
      const elementTypes = Object.values(ElementType);
      let elementsCreated = 0;
      for (const elementType of elementTypes) {
        const existing = await elementRepo.findOne({
          where: { character_id: character.id, element_type: elementType },
        });

        if (!existing) {
          const element = elementRepo.create({
            character_id: character.id,
            element_type: elementType,
            grade: ElementGrade.PHAM,
            level: 1,
            exp: 0,
          });
          await elementRepo.save(element);
          elementsCreated++;
        }
      }
      console.log(`  ✅ Elements: ${elementsCreated} new, ${elementTypes.length - elementsCreated} existing`);

      // Initialize all Qi
      const qiTypes = Object.values(QiType);
      let qiCreated = 0;
      
      // Default max amounts for each Qi type
      const defaultMaxAmounts: Record<QiType, number> = {
        [QiType.BLOOD_QI]: 10000,
        [QiType.SPIRITUAL_QI]: 10000,
        [QiType.VITAL_QI]: 1000,
        [QiType.RIGHTEOUS_QI]: 5000,
        [QiType.KILLING_QI]: 5000,
        [QiType.SCHOLARLY_QI]: 5000,
        [QiType.DEMONIC_QI]: 5000,
        [QiType.FROST_QI]: 3000,
        [QiType.YANG_QI]: 3000,
        [QiType.YIN_QI]: 3000,
        [QiType.IMPURE_QI]: 10000,
        [QiType.PRENATAL_QI]: 500,
        [QiType.GRANDMIST_PURPLE_QI]: 100,
        [QiType.CHAOS_QI]: 1000,
        [QiType.IMPERIAL_QI]: 2000,
        [QiType.AURA_QI]: 5000,
        [QiType.CORPSE_QI]: 3000,
        [QiType.DEATH_QI]: 5000,
        [QiType.RESENTMENT_QI]: 3000,
        [QiType.CHARM_QI]: 2000,
      };
      
      // Default regen rates
      const defaultRegenRates: Record<QiType, number> = {
        [QiType.BLOOD_QI]: 1,
        [QiType.SPIRITUAL_QI]: 1,
        [QiType.VITAL_QI]: 0,
        [QiType.RIGHTEOUS_QI]: 0.1,
        [QiType.KILLING_QI]: 0,
        [QiType.SCHOLARLY_QI]: 0.2,
        [QiType.DEMONIC_QI]: 0,
        [QiType.FROST_QI]: 0,
        [QiType.YANG_QI]: 0.5,
        [QiType.YIN_QI]: 0,
        [QiType.IMPURE_QI]: 0,
        [QiType.PRENATAL_QI]: 0,
        [QiType.GRANDMIST_PURPLE_QI]: 0,
        [QiType.CHAOS_QI]: 0,
        [QiType.IMPERIAL_QI]: 0.1,
        [QiType.AURA_QI]: 2,
        [QiType.CORPSE_QI]: 0,
        [QiType.DEATH_QI]: 0,
        [QiType.RESENTMENT_QI]: 0,
        [QiType.CHARM_QI]: 0.1,
      };
      
      // Default metadata
      const defaultMetadata: Partial<Record<QiType, any>> = {
        [QiType.IMPURE_QI]: { last_activity_at: new Date() },
        [QiType.DEMONIC_QI]: { berserk_active: false },
        [QiType.AURA_QI]: { shield_active: false, shield_amount: 0 },
        [QiType.CORPSE_QI]: { poison_stack: 0 },
        [QiType.KILLING_QI]: { kill_count: 0 },
        [QiType.RIGHTEOUS_QI]: { good_deed_count: 0 },
        [QiType.SCHOLARLY_QI]: { knowledge_points: 0 },
        [QiType.DEATH_QI]: { death_count: 0 },
        [QiType.RESENTMENT_QI]: { revenge_target: null },
        [QiType.CHARM_QI]: { charm_level: 0 },
      };
      
      for (const qiType of qiTypes) {
        const existing = await qiRepo.findOne({
          where: { character_id: character.id, qi_type: qiType },
        });

        if (!existing) {
          const qi = qiRepo.create({
            character_id: character.id,
            qi_type: qiType,
            amount: 0,
            max_amount: defaultMaxAmounts[qiType] || 1000,
            regen_rate: defaultRegenRates[qiType] || 0,
            metadata: defaultMetadata[qiType] || {},
          });
          await qiRepo.save(qi);
          qiCreated++;
        }
      }
      console.log(`  ✅ Qi: ${qiCreated} new, ${qiTypes.length - qiCreated} existing`);
    }

    console.log(`\n✅ Successfully initialized stats for ${characters.length} characters`);
  } catch (error) {
    console.error('❌ Error initializing character stats:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  initializeCharacterStats()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { initializeCharacterStats };

