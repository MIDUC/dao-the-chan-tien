import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Post('assign')
  async assignRoles(
    @Body() body: { userId: number; roleIds: number[] },
  ) {
    return this.rolesService.assignRolesToUser(body.userId, body.roleIds);
  }

  @Delete('user/:userId/role/:roleId')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.removeRoleFromUser(+userId, +roleId);
  }

  @Get('user/:userId/has-role/:roleName')
  async checkUserRole(
    @Param('userId') userId: string,
    @Param('roleName') roleName: string,
  ) {
    const hasRole = await this.rolesService.userHasRole(+userId, roleName);
    return { hasRole };
  }

  @Get('user/:userId/highest')
  async getUserHighestRole(@Param('userId') userId: string) {
    return this.rolesService.getUserHighestRole(+userId);
  }
}

