import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getDataSourceOptions } from '../config/database.config';

async function checkInventoryItems() {
  const dataSource = new DataSource(getDataSourceOptions());
  await dataSource.initialize();

  try {
    const result = await dataSource.query(`
      SELECT 
        inv.id, 
        inv.character_id, 
        inv.item_id, 
        inv.quantity, 
        i.name, 
        i.item_type, 
        i.element 
      FROM inventory inv 
      JOIN items i ON inv.item_id = i.id 
      WHERE inv.character_id = 1 
      AND i.item_type = 'material'
      LIMIT 10
    `);

    console.log('Items in inventory for character 1:');
    console.log(JSON.stringify(result, null, 2));
    console.log(`Total: ${result.length} items`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkInventoryItems();

