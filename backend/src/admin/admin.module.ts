import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../entities/user.entity';
import { Character } from '../entities/character.entity';
import { Item } from '../entities/item.entity';
import { NPC } from '../entities/npc.entity';
import { Quest } from '../entities/quest.entity';
import { Role } from '../entities/role.entity';
import { Achievement } from '../entities/achievement.entity';
import { Shop } from '../entities/shop.entity';
import { Skill } from '../entities/skill.entity';
import { SystemConfig } from '../entities/system-config.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Character,
      Item,
      NPC,
      Quest,
      Role,
      Achievement,
      Shop,
      Skill,
      SystemConfig,
    ]),
    RolesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

