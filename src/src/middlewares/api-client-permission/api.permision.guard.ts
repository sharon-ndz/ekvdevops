import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_PERMISSIONS_KEY, ApiPermission } from '.';
import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { ApiClient } from '../../entities/api-client.entity';
import { jwtConstants } from '../../core/constants/constants';
import { Status } from '../../core/constants/enums';

@Injectable()
export class ApiClientPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<ApiPermission[]>(
      API_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found in authorization header');
    }

    try {
      const decoded = jwt.verify(token, jwtConstants.apiClientSecret) as any;
      const apiClientRepository = getRepository(ApiClient);
      const apiClient = await apiClientRepository.findOne({
        where: { id: decoded.id, isActive: Status.Active },
      });
      if (!apiClient) {
        throw new UnauthorizedException('No clients found with given credentials');
      }

      return requiredPermissions.every((permission) => apiClient.permissions.includes(permission));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new UnauthorizedException('You dont have permission to access this endpoint');
    }
  }
}
