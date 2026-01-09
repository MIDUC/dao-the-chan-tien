import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Character } from '../entities/character.entity';
import { OfflineCultivationModule } from '../offline-cultivation/offline-cultivation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Character]),
    forwardRef(() => OfflineCultivationModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

