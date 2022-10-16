import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/login/kakao',
    });
  }

  validate(_, __, profile: any) {
    console.log(profile);
    return {
      email: profile._json.kakao_account.email,
      hashedPassword: '1234',
      name: profile.displayName,
      phonenumber: '01012345678',
    };
  }
}
