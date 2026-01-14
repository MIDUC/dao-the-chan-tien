import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { CharactersModule } from './characters/characters.module';
import { NpcsModule } from './npcs/npcs.module';
import { RolesModule } from './roles/roles.module';
import { CurrencyModule } from './currency/currency.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ShopsModule } from './shops/shops.module';
import { SkillsModule } from './skills/skills.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { FriendsModule } from './friends/friends.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { OfflineCultivationModule } from './offline-cultivation/offline-cultivation.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { StatusLogsModule } from './status-logs/status-logs.module';
import { RealmLevelsModule } from './realm-levels/realm-levels.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadController } from './upload/upload.controller';
import { QuestsModule } from './quests/quests.module';
import { EquipmentModule } from './equipment/equipment.module';
import { ItemsModule } from './items/items.module';
import { QiModule } from './qi/qi.module';
import { StatsModule } from './stats/stats.module';
import { FitnessModule } from './fitness/fitness.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env', // Don't use .env file in production (use Render env vars)
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig()),
    CloudinaryModule,
    UsersModule,
    CharactersModule,
    NpcsModule,
    RolesModule,
    CurrencyModule,
    AchievementsModule,
    ShopsModule,
    SkillsModule,
    LeaderboardsModule,
    FriendsModule,
    NotificationsModule,
    AuthModule,
    AdminModule,
    OfflineCultivationModule,
    SystemConfigModule,
    StatusLogsModule,
    RealmLevelsModule,
    QuestsModule,
    EquipmentModule,
    ItemsModule,
    QiModule,
    StatsModule,
    FitnessModule,
  ],
  controllers: [AppController, UploadController], // <--- Đã sửa đúng tại đây
  providers: [AppService],
})
export class AppModule {}
