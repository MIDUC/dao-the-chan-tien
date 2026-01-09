import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Character } from '../entities/character.entity';
import { CurrencyService } from '../currency/currency.service';
import { CurrencyType } from '../entities/currency.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private jwtService: JwtService,
    private currencyService: CurrencyService,
  ) {}

  /**
   * Register new user
   */
  async register(
    username: string,
    email: string,
    password: string,
    characterName: string,
  ): Promise<{ user: User; character: Character; token: string }> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      username,
      email,
      password_hash: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Check if user already has a character (should not happen, but safety check)
    const existingCharacter = await this.characterRepository.findOne({
      where: { user_id: savedUser.id },
    });

    if (existingCharacter) {
      throw new ConflictException('User already has a character');
    }

    // Create default character (1 user = 1 character)
    const character = this.characterRepository.create({
      user_id: savedUser.id,
      display_name: characterName,
      realm_level: 1,
      exp: 0,
      strength: 10,
      agility: 10,
      wisdom: 10,
    });

    const savedCharacter = await this.characterRepository.save(character);

    // Initialize currencies
    await this.currencyService.initializeCharacterCurrencies(savedCharacter.id);

    // Generate JWT token
    const token = this.jwtService.sign({
      userId: savedUser.id,
      username: savedUser.username,
    });

    return {
      user: savedUser,
      character: savedCharacter,
      token,
    };
  }

  /**
   * Login user
   */
  async login(
    username: string,
    password: string,
  ): Promise<{ user: User; character: Character | null; token: string }> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['characters', 'roles'],
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get first character
    const character =
      user.characters && user.characters.length > 0 ? user.characters[0] : null;

    // Update last_login_at for offline cultivation
    if (character) {
      character.last_login_at = new Date();
      await this.characterRepository.save(character);
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      userId: user.id,
      username: user.username,
    });

    return {
      user,
      character,
      token,
    };
  }

  /**
   * Validate user from JWT payload
   */
  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['characters', 'roles'],
    });
  }
}

