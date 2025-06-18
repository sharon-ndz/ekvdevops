import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiClient } from '../entities/api-client.entity';
import { jwtConstants } from '../core/constants/constants';
import { Status } from '../core/constants/enums';

@Injectable()
export class JwtAPIClientsStrategy extends PassportStrategy(Strategy, 'jwt-strategy-api') {
  constructor(
    @InjectRepository(ApiClient)
    private apiClientRepository: Repository<ApiClient>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.apiClientSecret,
    });
  }

  async validate(payload: any) {
    const client = await this.apiClientRepository.findOneBy({
      id: payload.id,
      isActive: Status.Active,
    });
    if (!client) {
      throw new UnauthorizedException('Invalid Authorization key');
    }

    return {
      id: payload.id,
      clientName: payload.clientName,
      clientEmail: payload.clientEmail,
      clientPhone: payload.clientPhone,
    };
  }
}
