import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { IOAuthUser } from 'src/commons/type/context';
import { AuthsService } from './auths.service';

@Controller()
export class AuthsController {
  constructor(
    private readonly authsService: AuthsService, //
  ) {}
  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.authsService.socialLogin(req, res);
  }

  @UseGuards(AuthGuard('kakao'))
  @Get('/login/kakao')
  async loginKakao(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.authsService.socialLogin(req, res);
  }

  @UseGuards(AuthGuard('naver'))
  @Get('/login/naver')
  async loginNaver(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.authsService.socialLogin(req, res);
  }
}
