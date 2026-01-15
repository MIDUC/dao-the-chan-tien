import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getDataSourceOptions } from '../config/database.config';

async function checkItems() {
  const dataSource = new DataSource(getDataSourceOptions());
  await dataSource.initialize();

  try {
    const result = await dataSource.query(`
      SELECT 
        i.id, 
        i.name, 
        i.item_type, 
        i.element, 
        i.category,
        inv.quantity
      FROM inventory inv 
      JOIN items i ON inv.item_id = i.id 
      WHERE inv.character_id = 1 
      AND i.item_type = 'material'
      LIMIT 10
    `);

    console.log('Items in inventory:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkItems();

