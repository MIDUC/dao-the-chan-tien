import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

/**
 * Migration script to fix currency_type enum
 * This script deletes all existing currency records to allow enum update
 * Run this before starting the server after adding new currency types
 */
async function fixCurrencyEnum() {
  // Load environment variables
  dotenv.config();

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'mypassword',
    database: process.env.DB_DATABASE || 'dao_the_chan_tien',
  });

  try {
    console.log('✅ Database connected');

    // Delete all existing currency records to allow enum update
    await connection.query('DELETE FROM currency');
    console.log('✅ Deleted all existing currency records');

    // Now manually update the enum to include new values
    await connection.query(`
      ALTER TABLE \`currency\` 
      MODIFY COLUMN \`currency_type\` 
      ENUM('ling_stone', 'merit_point', 'essence', 'immortal_jade', 'immortal_jade_locked') 
      NOT NULL
    `);
    console.log('✅ Updated currency_type enum successfully');

    console.log('✅ Currency enum fixed. You can now restart the server.');

    await connection.end();
  } catch (error: any) {
    console.error('❌ Error fixing currency enum:', error.message);
    await connection.end();
    process.exit(1);
  }
}

fixCurrencyEnum();

