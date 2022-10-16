import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'myAccessKey',
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const accessToken = req.headers['authorization'].replace('Bearer ', '');
    const result = await this.cacheManager.get(`accessToken:${accessToken}`);

    if (result) {
      throw new UnauthorizedException('이미 로그아웃되었습니다.');
    }

    return {
      email: payload.email,
      id: payload.sub,
    };
  }
}
