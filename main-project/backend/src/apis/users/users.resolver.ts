import { UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { UpdateUserInput } from './dto/updateUser.input';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import * as bcrypt from 'bcrypt';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => String)
  fetchUser(
    @Context() context: any, //
  ) {
    // 유저 정보 꺼내오기
    console.log(context.req.user);
    console.log('fetchUser 실행 완료');
    return 'fetchUser가 실행되었습니다.';
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [User])
  fetchUsers() {
    return this.userService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  fetchLoginUser(
    @Args('userId') userId: string, //
  ) {
    return this.userService.findOne({ userId });
  }

  @Query(() => [User])
  fetchUserWithDeleted() {
    return this.userService.WithDelete();
  }

  @Mutation(() => User)
  async createUser(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string,
    @Args('phonenumber') phonenumber: string,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10.2);

    return this.userService.create({
      email,
      hashedPassword,
      name,
      phonenumber,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateLoginUser(
    @Args('userId') userId: string,
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput, //
  ) {
    // 1. 로그인 (이메일이 일치하는 유저를 DB에서 찾기)
    const user = await this.userService.findOneUser({ email });

    // 2. 일치하는 유저가 없으면 에러 던지기
    if (!user) throw new UnprocessableEntityException('이메일이 없습니다.');

    // 3. 일치하는 유저가 있지만 비밀번호가 틀렸다면 에러 던지기
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth)
      throw new UnprocessableEntityException('비밀번호가 틀렸습니다.');

    const loginhass = await bcrypt.hash(updateUserInput.password, 10.2);

    return this.userService.update({ userId, updateUserInput, loginhass });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteLoginUser(
    @Args('userId') userId: string, //
  ) {
    return this.userService.delete({ userId });
  }

  @Mutation(() => Boolean)
  restoreUser(
    @Args('userId') userId: string, //
  ) {
    return this.userService.restore({ userId });
  }
}
