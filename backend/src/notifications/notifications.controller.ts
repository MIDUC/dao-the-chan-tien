import { Controller, Get, Param, Post, Body, Delete, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('character/:characterId')
  async getCharacterNotifications(
    @Param('characterId') characterId: string,
    @Query('unreadOnly') unreadOnly: string = 'false',
  ) {
    return this.notificationsService.getCharacterNotifications(
      +characterId,
      unreadOnly === 'true',
    );
  }

  @Get('character/:characterId/unread-count')
  async getUnreadCount(@Param('characterId') characterId: string) {
    const count = await this.notificationsService.getUnreadCount(+characterId);
    return { count };
  }

  @Post('read/:id')
  async markAsRead(
    @Param('id') id: string,
    @Body() body: { characterId: number },
  ) {
    return this.notificationsService.markAsRead(+id, body.characterId);
  }

  @Post('read-all')
  async markAllAsRead(@Body() body: { characterId: number }) {
    return this.notificationsService.markAllAsRead(body.characterId);
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string,
    @Body() body: { characterId: number },
  ) {
    return this.notificationsService.deleteNotification(+id, body.characterId);
  }
}

