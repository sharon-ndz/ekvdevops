import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-strategy-user') {}

@Injectable()
export class JwtAuthGuardApi extends AuthGuard('jwt-strategy-api') {}
