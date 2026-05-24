import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  // Si el carnet es válido y no está caducado, NestJS ejecutará esta función
  async validate(payload: any) {
    // Devolvemos los datos del usuario para que el controlador sepa quién está haciendo la petición
    return { userId: payload.sub, email: payload.email };
  }
}
