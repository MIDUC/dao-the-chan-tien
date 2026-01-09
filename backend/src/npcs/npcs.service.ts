import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NPC } from '../entities/npc.entity';
import { Quest } from '../entities/quest.entity';

@Injectable()
export class NpcsService {
  constructor(
    @InjectRepository(NPC)
    private npcRepository: Repository<NPC>,
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
  ) {}

  async findAll(): Promise<NPC[]> {
    return this.npcRepository.find({
      where: { is_active: true },
      relations: ['quests'],
    });
  }

  async findOne(id: number): Promise<NPC | null> {
    return this.npcRepository.findOne({
      where: { id, is_active: true },
      relations: ['quests'],
    });
  }

  async getAvailableQuests(npcId: number): Promise<Quest[]> {
    return this.questRepository.find({
      where: { npc_id: npcId, is_active: true },
      relations: ['npc'],
    });
  }
}

