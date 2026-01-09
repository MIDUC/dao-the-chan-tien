import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { priority: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
    });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  /**
   * Assign role(s) to a user
   */
  async assignRolesToUser(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const roles = await this.roleRepository.find({
      where: roleIds.map((id) => ({ id })),
    });
    user.roles = [...(user.roles || []), ...roles];
    return this.userRepository.save(user);
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: number, roleId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    user.roles = user.roles?.filter((role) => role.id !== roleId) || [];
    return this.userRepository.save(user);
  }

  /**
   * Check if user has a specific role
   */
  async userHasRole(userId: number, roleName: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user || !user.roles) {
      return false;
    }

    return user.roles.some((role) => role.name === roleName);
  }

  /**
   * Get user's highest priority role
   */
  async getUserHighestRole(userId: number): Promise<Role | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user || !user.roles || user.roles.length === 0) {
      return null;
    }

    return user.roles.reduce((highest, current) =>
      current.priority > highest.priority ? current : highest,
    );
  }
}

