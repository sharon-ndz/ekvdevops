import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, _KEY } from './permissions.decorator';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../../api/users/users.service';
import { Status } from '../../core/constants/enums';
import { jwtConstants } from '../../core/constants/constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Permission[]>(_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return false;
    }

    try {
      const decoded = jwt.verify(token, jwtConstants.secret) as any;
      let permissions = [];
      const user = await this.usersService.findUser({
        where: { id: decoded.id, isActive: Status.Active },
        relations: ['permissions'],
      });
      if (!user) {
        throw new UnauthorizedException('No user found with given credentials');
      }
      if (!user.roleId) {
        return false; // user has no role, deny access
      }
      permissions = user.permissions.split(',');
      return requiredRoles.some((permission) => permissions.includes(permission));
    } catch (err: any) {
      console.log(err);
      throw new UnauthorizedException('permission required');
    }
  }
}
