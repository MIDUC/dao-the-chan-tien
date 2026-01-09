import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, FindOptionsWhere } from 'typeorm';
import { StatusLog, StatusLogType } from '../entities/status-log.entity';
import { Character } from '../entities/character.entity';
import { PartyMember } from '../entities/party-member.entity';
import { GuildMember } from '../entities/guild-member.entity';

@Injectable()
export class StatusLogsService {
  constructor(
    @InjectRepository(StatusLog)
    private statusLogRepository: Repository<StatusLog>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(PartyMember)
    private partyMemberRepository: Repository<PartyMember>,
    @InjectRepository(GuildMember)
    private guildMemberRepository: Repository<GuildMember>,
  ) {}

  /**
   * Get status logs based on character context
   * Logic:
   * - If character has party_id: show logs of all party members
   * - If character has guild_id: show logs of all guild members
   * - If character has neither: show logs of that character only
   * - If no character_id: show public logs (where all IDs are null)
   */
  async getStatusLogs(
    characterId?: number,
    filters?: { type?: StatusLogType },
  ) {
    if (!characterId) {
      // Public logs - no user_id, party_id, guild_id
      const where: FindOptionsWhere<StatusLog> = {
        character_id: IsNull(),
        party_id: IsNull(),
        guild_id: IsNull(),
      };
      if (filters?.type) {
        where.type = filters.type;
      }
      return this.statusLogRepository.find({
        where,
        order: { created_at: 'DESC' },
        take: 50, // Max 50 most recent logs
      });
    }

    // Get character info
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      return [];
    }

    // Check if character is in a party
    const partyMember = await this.partyMemberRepository.findOne({
      where: { character_id: characterId },
      relations: ['party'],
    });

    // Check if character is in a guild
    const guildMember = await this.guildMemberRepository.findOne({
      where: { character_id: characterId },
      relations: ['guild'],
    });

    const whereConditions: FindOptionsWhere<StatusLog> = {};

    if (partyMember?.party_id) {
      // Show logs of all party members
      const partyMembers = await this.partyMemberRepository.find({
        where: { party_id: partyMember.party_id },
      });
      const characterIds = partyMembers.map((m) => m.character_id);
      whereConditions.character_id = In(characterIds);
    } else if (guildMember?.guild_id) {
      // Show logs of all guild members
      const guildMembers = await this.guildMemberRepository.find({
        where: { guild_id: guildMember.guild_id },
      });
      const characterIds = guildMembers.map((m) => m.character_id);
      whereConditions.character_id = In(characterIds);
    } else {
      // Show logs of this character only
      whereConditions.character_id = characterId;
    }

    if (filters?.type) {
      whereConditions.type = filters.type;
    }

    return this.statusLogRepository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: 50,
      relations: ['character'],
    });
  }

  /**
   * Create a new status log
   */
  async createStatusLog(data: {
    character_id?: number;
    party_id?: number;
    guild_id?: number;
    type: StatusLogType;
    message: string;
  }) {
    const log = this.statusLogRepository.create(data);
    return this.statusLogRepository.save(log);
  }

  /**
   * Get status logs by party ID
   */
  async getStatusLogsByParty(
    partyId: number,
    filters?: { type?: StatusLogType },
  ) {
    const whereConditions: FindOptionsWhere<StatusLog> = { party_id: partyId };
    if (filters?.type) {
      whereConditions.type = filters.type;
    }
    return this.statusLogRepository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: 50, // Max 50 most recent logs
      relations: ['character'],
    });
  }

  /**
   * Get status logs by guild ID
   */
  async getStatusLogsByGuild(
    guildId: number,
    filters?: { type?: StatusLogType },
  ) {
    const whereConditions: FindOptionsWhere<StatusLog> = { guild_id: guildId };
    if (filters?.type) {
      whereConditions.type = filters.type;
    }
    return this.statusLogRepository.find({
      where: whereConditions,
      order: { created_at: 'DESC' },
      take: 50, // Max 50 most recent logs
      relations: ['character'],
    });
  }
}
