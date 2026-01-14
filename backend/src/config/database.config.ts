import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => {
  // Support TiDB Cloud connection string or individual parameters
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    // Parse connection string (format: mysql://user:password@host:port/database)
    const url = new URL(dbUrl);
    return {
      type: 'mysql',
      host: url.hostname,
      port: parseInt(url.port || '4000', 10), // TiDB Cloud default port is 4000
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading '/'
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      extra: {
        connectionLimit: 10,
        timezone: 'Z', // UTC timezone
      },
    };
  }

  // Use individual parameters (for TiDB Cloud or local MySQL)
  // Read from environment variables - no hardcoded defaults
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 4000;
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_DATABASE;

  if (!host || !username || !password || !database) {
    throw new Error(
      'Database configuration is missing. Please set DB_HOST, DB_USERNAME, DB_PASSWORD, and DB_DATABASE in your .env file',
    );
  }

  return {
    type: 'mysql',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    extra: {
      connectionLimit: 10,
      timezone: 'Z', // UTC timezone
    },
  };
};

/**
 * Get DataSource options for TypeORM DataSource (used in seed scripts)
 */
export const getDataSourceOptions = (): DataSourceOptions => {
  // Support TiDB Cloud connection string or individual parameters
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    // Parse connection string (format: mysql://user:password@host:port/database)
    const url = new URL(dbUrl);
    return {
      type: 'mysql',
      host: url.hostname,
      port: parseInt(url.port || '4000', 10), // TiDB Cloud default port is 4000
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading '/'
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      extra: {
        connectionLimit: 10,
        timezone: 'Z', // UTC timezone
      },
    };
  }

  // Use individual parameters (for TiDB Cloud or local MySQL)
  // Read from environment variables - no hardcoded defaults
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 4000;
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_DATABASE;

  if (!host || !username || !password || !database) {
    throw new Error(
      'Database configuration is missing. Please set DB_HOST, DB_USERNAME, DB_PASSWORD, and DB_DATABASE in your .env file',
    );
  }

  return {
    type: 'mysql',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    extra: {
      connectionLimit: 10,
      timezone: 'Z', // UTC timezone
    },
  };
};
