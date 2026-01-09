import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NpcsController } from './npcs.controller';
import { NpcsService } from './npcs.service';
import { NPC } from '../entities/npc.entity';
import { Quest } from '../entities/quest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NPC, Quest])],
  controllers: [NpcsController],
  providers: [NpcsService],
  exports: [NpcsService],
})
export class NpcsModule {}
