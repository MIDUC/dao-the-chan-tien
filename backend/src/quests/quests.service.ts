import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest, QuestStatus } from '../entities/quest.entity';
import { CharacterQuest } from '../entities/character-quest.entity';
import { Character } from '../entities/character.entity';
import { Item } from '../entities/item.entity';
import { Inventory } from '../entities/inventory.entity';
import { addItemToInventory } from '../utils/inventory.util';
import { CurrencyService } from '../currency/currency.service';
import { CurrencyType } from '../entities/currency.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(CharacterQuest)
    private characterQuestRepository: Repository<CharacterQuest>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private currencyService: CurrencyService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Get all available quests
   */
  async getAvailableQuests(): Promise<Quest[]> {
    return this.questRepository.find({
      where: { is_active: true },
      relations: ['npc'],
    });
  }

  /**
   * Get quest by ID
   */
  async getQuestById(id: number): Promise<Quest | null> {
    return this.questRepository.findOne({
      where: { id, is_active: true },
      relations: ['npc'],
    });
  }

  /**
   * Get character's quests
   */
  async getCharacterQuests(characterId: number): Promise<CharacterQuest[]> {
    return this.characterQuestRepository.find({
      where: { character_id: characterId },
      relations: ['quest', 'quest.npc'],
      order: { accepted_at: 'DESC' },
    });
  }

  /**
   * Accept a quest
   */
  async acceptQuest(
    characterId: number,
    questId: number,
  ): Promise<{ success: boolean; message: string; characterQuest?: CharacterQuest }> {
    const quest = await this.questRepository.findOne({
      where: { id: questId, is_active: true },
    });

    if (!quest) {
      return { success: false, message: 'Quest not found or inactive' };
    }

    // Check if character already has this quest
    const existing = await this.characterQuestRepository.findOne({
      where: {
        character_id: characterId,
        quest_id: questId,
        status: QuestStatus.ACCEPTED,
      },
    });

    if (existing) {
      return { success: false, message: 'Quest already accepted' };
    }

    // Create character quest
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + quest.deadline_hours);

    const characterQuest = this.characterQuestRepository.create({
      character_id: characterId,
      quest_id: questId,
      status: QuestStatus.ACCEPTED,
      accepted_at: new Date(),
      deadline,
      progress: {
        current: 0,
        target: quest.requirements?.target || 0,
      },
    });

    const saved = await this.characterQuestRepository.save(characterQuest);

    // Send notification
    await this.notificationsService.createNotification(
      characterId,
      NotificationType.QUEST_DEADLINE,
      'Đã nhận nhiệm vụ',
      `Bạn đã nhận nhiệm vụ: ${quest.title}`,
    );

    return {
      success: true,
      message: 'Quest accepted successfully',
      characterQuest: saved,
    };
  }

  /**
   * Update quest progress
   */
  async updateQuestProgress(
    characterId: number,
    questId: number,
    progress: number,
  ): Promise<{ success: boolean; message: string; completed?: boolean }> {
    const characterQuest = await this.characterQuestRepository.findOne({
      where: {
        character_id: characterId,
        quest_id: questId,
        status: QuestStatus.ACCEPTED,
      },
      relations: ['quest'],
    });

    if (!characterQuest) {
      return { success: false, message: 'Quest not found or not accepted' };
    }

    // Check deadline
    if (characterQuest.deadline && new Date() > characterQuest.deadline) {
      characterQuest.status = QuestStatus.EXPIRED;
      await this.characterQuestRepository.save(characterQuest);
      return { success: false, message: 'Quest expired' };
    }

    // Update progress
    const target = characterQuest.quest.requirements?.target || 0;
    const newProgress = Math.min(progress, target);

    characterQuest.progress = {
      current: newProgress,
      target,
    };

    await this.characterQuestRepository.save(characterQuest);

    // Check if completed
    if (newProgress >= target) {
      return { success: true, message: 'Progress updated', completed: true };
    }

    return { success: true, message: 'Progress updated', completed: false };
  }

  /**
   * Complete a quest and give rewards
   */
  async completeQuest(
    characterId: number,
    questId: number,
  ): Promise<{ success: boolean; message: string; rewards?: any }> {
    const characterQuest = await this.characterQuestRepository.findOne({
      where: {
        character_id: characterId,
        quest_id: questId,
      },
      relations: ['quest', 'character'],
    });

    if (!characterQuest) {
      return { success: false, message: 'Quest not found' };
    }

    if (characterQuest.status !== QuestStatus.ACCEPTED) {
      return { success: false, message: 'Quest is not in accepted status' };
    }

    // Check if quest is completed
    const target = characterQuest.quest.requirements?.target || 0;
    const current = characterQuest.progress?.current || 0;

    if (current < target) {
      return { success: false, message: 'Quest not completed yet' };
    }

    // Check deadline
    if (characterQuest.deadline && new Date() > characterQuest.deadline) {
      characterQuest.status = QuestStatus.EXPIRED;
      await this.characterQuestRepository.save(characterQuest);
      return { success: false, message: 'Quest expired' };
    }

    const character = characterQuest.character;
    const quest = characterQuest.quest;
    const rewards: any = {};

    // Give EXP
    if (quest.reward.exp) {
      character.exp += quest.reward.exp;
      rewards.exp = quest.reward.exp;
    }

    // Give spirit (if any)
    if (quest.reward.spirit) {
      // Add spirit to currency or character stat
      await this.currencyService.addCurrency(
        characterId,
        CurrencyType.ESSENCE,
        quest.reward.spirit,
      );
      rewards.spirit = quest.reward.spirit;
    }

    // Give items
    if (quest.reward.items && quest.reward.items.length > 0) {
      rewards.items = [];
      for (const rewardItem of quest.reward.items) {
        const item = await this.itemRepository.findOne({
          where: { id: rewardItem.id },
        });

        if (item) {
          await addItemToInventory(
            this.inventoryRepository,
            characterId,
            item,
            rewardItem.quantity,
          );
          rewards.items.push({
            item_id: item.id,
            item_name: item.name,
            quantity: rewardItem.quantity,
          });
        }
      }
    }

    // Update character
    await this.characterRepository.save(character);

    // Mark quest as completed
    characterQuest.status = QuestStatus.COMPLETED;
    characterQuest.completed_at = new Date();
    await this.characterQuestRepository.save(characterQuest);

    // Send notification
    await this.notificationsService.createNotification(
      characterId,
      NotificationType.ACHIEVEMENT,
      'Hoàn thành nhiệm vụ',
      `Bạn đã hoàn thành nhiệm vụ: ${quest.title}`,
    );

    return {
      success: true,
      message: 'Quest completed successfully',
      rewards,
    };
  }

  /**
   * Cancel/Abandon a quest
   */
  async abandonQuest(
    characterId: number,
    questId: number,
  ): Promise<{ success: boolean; message: string }> {
    const characterQuest = await this.characterQuestRepository.findOne({
      where: {
        character_id: characterId,
        quest_id: questId,
        status: QuestStatus.ACCEPTED,
      },
    });

    if (!characterQuest) {
      return { success: false, message: 'Quest not found or not accepted' };
    }

    // Mark as failed
    characterQuest.status = QuestStatus.FAILED;
    await this.characterQuestRepository.save(characterQuest);

    return { success: true, message: 'Quest abandoned' };
  }
}

