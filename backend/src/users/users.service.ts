import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Character } from '../entities/character.entity';
import { OfflineCultivationService } from '../offline-cultivation/offline-cultivation.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @Inject(forwardRef(() => OfflineCultivationService))
    private offlineCultivationService: OfflineCultivationService,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: ['characters', 'roles'],
    });
    
    // Process passive cultivation for all characters
    for (const user of users) {
      if (user.characters && user.characters.length > 0) {
        for (const character of user.characters) {
          await this.offlineCultivationService.processPassiveCultivation(character.id);
        }
      }
    }
    
    // Fetch again to get updated data
    return this.userRepository.find({
      relations: ['characters', 'roles'],
    });
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['characters', 'roles'],
    });
    
    // Process passive cultivation for character
    if (user && user.characters && user.characters.length > 0) {
      for (const character of user.characters) {
        await this.offlineCultivationService.processPassiveCultivation(character.id);
      }
    }
    
    // Fetch again to get updated data
    return this.userRepository.findOne({
      where: { id },
      relations: ['characters', 'roles'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}

