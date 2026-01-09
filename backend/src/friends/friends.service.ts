import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend, FriendStatus } from '../entities/friend.entity';
import { Character } from '../entities/character.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  /**
   * Get character friends
   */
  async getCharacterFriends(characterId: number, status?: FriendStatus): Promise<Friend[]> {
    const where: any = { character_id: characterId };
    if (status) {
      where.status = status;
    }

    return this.friendRepository.find({
      where,
      relations: ['friend'],
    });
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(
    requesterId: number,
    targetId: number,
  ): Promise<{ success: boolean; message: string; friend?: Friend }> {
    if (requesterId === targetId) {
      return { success: false, message: 'Cannot add yourself as friend' };
    }

    // Check if already friends or pending
    const existing = await this.friendRepository.findOne({
      where: [
        { character_id: requesterId, friend_character_id: targetId },
        { character_id: targetId, friend_character_id: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === FriendStatus.ACCEPTED) {
        return { success: false, message: 'Already friends' };
      }
      if (existing.status === FriendStatus.PENDING) {
        return { success: false, message: 'Friend request already pending' };
      }
      if (existing.status === FriendStatus.BLOCKED) {
        return { success: false, message: 'User is blocked' };
      }
    }

    // Check if target exists
    const target = await this.characterRepository.findOne({ where: { id: targetId } });
    if (!target) {
      return { success: false, message: 'Target character not found' };
    }

    // Create friend request
    const friend = this.friendRepository.create({
      character_id: requesterId,
      friend_character_id: targetId,
      status: FriendStatus.PENDING,
      requester_id: requesterId,
    });

    const saved = await this.friendRepository.save(friend);
    return { success: true, message: 'Friend request sent', friend: saved };
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(
    characterId: number,
    friendId: number,
  ): Promise<{ success: boolean; message: string }> {
    const friend = await this.friendRepository.findOne({
      where: {
        character_id: friendId,
        friend_character_id: characterId,
        status: FriendStatus.PENDING,
      },
    });

    if (!friend) {
      return { success: false, message: 'Friend request not found' };
    }

    friend.status = FriendStatus.ACCEPTED;
    friend.accepted_at = new Date();
    await this.friendRepository.save(friend);

    return { success: true, message: 'Friend request accepted' };
  }

  /**
   * Reject/Remove friend
   */
  async removeFriend(
    characterId: number,
    friendId: number,
  ): Promise<{ success: boolean; message: string }> {
    const friend = await this.friendRepository.findOne({
      where: [
        { character_id: characterId, friend_character_id: friendId },
        { character_id: friendId, friend_character_id: characterId },
      ],
    });

    if (!friend) {
      return { success: false, message: 'Friendship not found' };
    }

    await this.friendRepository.remove(friend);
    return { success: true, message: 'Friend removed' };
  }

  /**
   * Block user
   */
  async blockUser(
    characterId: number,
    targetId: number,
  ): Promise<{ success: boolean; message: string }> {
    let friend = await this.friendRepository.findOne({
      where: [
        { character_id: characterId, friend_character_id: targetId },
        { character_id: targetId, friend_character_id: characterId },
      ],
    });

    if (!friend) {
      friend = this.friendRepository.create({
        character_id: characterId,
        friend_character_id: targetId,
        status: FriendStatus.BLOCKED,
        requester_id: characterId,
      });
    } else {
      friend.status = FriendStatus.BLOCKED;
    }

    await this.friendRepository.save(friend);
    return { success: true, message: 'User blocked' };
  }
}

