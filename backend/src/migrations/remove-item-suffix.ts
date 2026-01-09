import { DataSource } from 'typeorm';
import { getDataSourceOptions } from '../config/database.config';
import { Item } from '../entities/item.entity';

async function removeSuffixes() {
  const dataSource = new DataSource(getDataSourceOptions());

  try {
    await dataSource.initialize();
    console.log('📦 Connected to database');

    const itemRepo = dataSource.getRepository(Item);
    const items = await itemRepo.find();

    console.log(`Found ${items.length} items to check`);

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
        await itemRepo.save(item);
        updatedCount++;
        console.log(`✅ Updated: "${originalName}" → "${newName}"`);
      }
    }

    console.log(`\n✨ Updated ${updatedCount} items`);
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

removeSuffixes();

