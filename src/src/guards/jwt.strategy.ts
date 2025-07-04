import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../api/users/users.service';
import { jwtConstants } from '../core/constants/constants';
import { Status } from '../core/constants/enums';
import { getFullName } from '../core/helpers/functions.helpers';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-strategy-user') {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findUserBy({ id: payload.id, isActive: Status.Active }); // Assuming 'sub' is the user ID
    if (!user) {
      throw new UnauthorizedException('Invalid Authorization key');
    }
    return {
      id: payload.id,
      name: getFullName(user),
      roleId: +payload.roleId,
      roleName: payload.roleName,
      stateId: payload.stateId,
      lgaId: payload.lgaId,
      drivingSchoolId: payload.drivingSchoolId,
      email: payload.email,
      isActive: payload.isActive,
    };
  }
}
