import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusLogsController } from './status-logs.controller';
import { StatusLogsService } from './status-logs.service';
import { StatusLog } from '../entities/status-log.entity';
import { Character } from '../entities/character.entity';
import { PartyMember } from '../entities/party-member.entity';
import { GuildMember } from '../entities/guild-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StatusLog, Character, PartyMember, GuildMember]),
  ],
  controllers: [StatusLogsController],
  providers: [StatusLogsService],
  exports: [StatusLogsService],
})
export class StatusLogsModule {}

