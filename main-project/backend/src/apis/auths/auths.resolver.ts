import {
  CACHE_MANAGER,
  Inject,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { UserService } from '../users/users.service';
import { AuthsService } from './auths.service';
import * as bcrypt from 'bcrypt';
import { IContext } from 'src/commons/type/context';
import {
  GqlAuthAccessGuard,
  GqlAuthResfreshGuard,
} from 'src/commons/auth/gql-auth.guard';
import { Cache } from 'cache-manager';
import * as jwt from 'jsonwebtoken';

@Resolver()
export class AuthsResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authsService: AuthsService, //

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Mutation(() => String)
  async login(
    @Args('email') email: string, //
    @Args('password') password: string,
    @Context() context: IContext,
  ) {
    // 1. 로그인 (이메일이 일치하는 유저를 DB에서 찾기)
    const user = await this.userService.findOneUser({ email });

    // 2. 일치하는 유저가 없으면 에러 던지기
    if (!user) throw new UnprocessableEntityException('이메일이 없습니다.');

    // 3. 일치하는 유저가 있지만 비밀번호가 틀렸다면 에러 던지기
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth)
      throw new UnprocessableEntityException('비밀번호가 틀렸습니다.');

    // 4. refreshToken(=JWT) 만들어서 프론트엔드 브라우저 쿠키에 저장해서 보내 주기
    this.authsService.setRefreshToken({ user, res: context.res });

    // 5. 일치하는 유저가 있고 비밀번호도 맞았다면
    // => accessToken(= JWT)을 만들어서 브라우저에 전달
    return this.authsService.getAccessToken({ user });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async logout(
    @Context() context: IContext, //
  ) {
    try {
      // 1. 토큰 가져오기
      const accessToken = context.req.headers['authorization'].replace(
        'Bearer ',
        '',
      );
      const refreshToken = context.req.headers['cookie'].replace(
        'refreshToken=',
        '',
      );

      // 2. 토큰 검증하기
      jwt.verify(accessToken, 'myAccessKey');
      jwt.verify(refreshToken, 'myRefreshKey');

      // 3. redis에 로그아웃 blacklist 저장하기
      await this.cacheManager.set(
        `accessToken:${accessToken}`, //
        'accessToken',
        { ttl: 3600 },
      );

      await this.cacheManager.set(
        `refreshToken:${refreshToken}`, //
        'refreshToken',
        { ttl: 1209600 },
      );

      return '로그아웃에 성공했습니다.';
    } catch (error) {
      if (error) throw new UnauthorizedException(error.response);
    }
  }

  @UseGuards(GqlAuthResfreshGuard)
  @Mutation(() => String)
  restoreAccessToken(
    @Context() context: IContext, //
  ) {
    return this.authsService.getAccessToken({ user: context });
  }
}
