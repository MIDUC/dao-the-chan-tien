import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check if user has any of the required roles
    if (user.roles && user.roles.length > 0) {
      const userRoleNames = user.roles.map((role) => role.name);
      return requiredRoles.some((role) => userRoleNames.includes(role));
    }

    // Check via service
    for (const roleName of requiredRoles) {
      const hasRole = await this.rolesService.userHasRole(user.id, roleName);
      if (hasRole) {
        return true;
      }
    }

    return false;
  }
}
