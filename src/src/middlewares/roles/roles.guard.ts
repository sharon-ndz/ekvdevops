import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  applyDecorators,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from '../../core/constants/constants';

// Metadata Key for Roles
export const ROLES_KEY = 'roles';

// Role Decorator
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
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
      const user = jwt.verify(token, jwtConstants.secret) as any;
      if (!user) {
        throw new UnauthorizedException('No user found with given credentials');
      }
      if (!user || !user.roleId) {
        return false; // No user or user has no role, deny access
      }
      return requiredRoles.some((role) => user.roleId === role);
    } catch (err: any) {
      console.log(err);
      throw new UnauthorizedException('role required');
    }
  }
}

// Combined Guard Decorator
export const AllowedRoles = (...roles: number[]) =>
  applyDecorators(UseGuards(RolesGuard), Roles(...roles));
