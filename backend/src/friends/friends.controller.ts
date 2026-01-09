import { Controller, Get, Param, Post, Body, Delete, Query } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendStatus } from '../entities/friend.entity';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('character/:characterId')
  async getCharacterFriends(
    @Param('characterId') characterId: string,
    @Query('status') status?: FriendStatus,
  ) {
    return this.friendsService.getCharacterFriends(+characterId, status);
  }

  @Post('request')
  async sendFriendRequest(
    @Body() body: { requesterId: number; targetId: number },
  ) {
    return this.friendsService.sendFriendRequest(body.requesterId, body.targetId);
  }

  @Post('accept')
  async acceptFriendRequest(
    @Body() body: { characterId: number; friendId: number },
  ) {
    return this.friendsService.acceptFriendRequest(body.characterId, body.friendId);
  }

  @Delete('remove')
  async removeFriend(@Body() body: { characterId: number; friendId: number }) {
    return this.friendsService.removeFriend(body.characterId, body.friendId);
  }

  @Post('block')
  async blockUser(@Body() body: { characterId: number; targetId: number }) {
    return this.friendsService.blockUser(body.characterId, body.targetId);
  }
}

