import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { Character } from '../entities/character.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  /**
   * Get character notifications
   */
  async getCharacterNotifications(
    characterId: number,
    unreadOnly: boolean = false,
  ): Promise<Notification[]> {
    const where: any = { character_id: characterId, is_deleted: false };
    if (unreadOnly) {
      where.is_read = false;
    }

    return this.notificationRepository.find({
      where,
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  /**
   * Create notification
   */
  async createNotification(
    characterId: number,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      character_id: characterId,
      notification_type: type,
      title,
      message,
      data,
      is_read: false,
      is_deleted: false,
    });

    return this.notificationRepository.save(notification);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, characterId: number): Promise<{ success: boolean }> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, character_id: characterId },
    });

    if (!notification) {
      return { success: false };
    }

    notification.is_read = true;
    await this.notificationRepository.save(notification);
    return { success: true };
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(characterId: number): Promise<{ success: boolean }> {
    await this.notificationRepository.update(
      { character_id: characterId, is_read: false },
      { is_read: true },
    );
    return { success: true };
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number, characterId: number): Promise<{ success: boolean }> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, character_id: characterId },
    });

    if (!notification) {
      return { success: false };
    }

    notification.is_deleted = true;
    await this.notificationRepository.save(notification);
    return { success: true };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(characterId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { character_id: characterId, is_read: false, is_deleted: false },
    });
  }
}

