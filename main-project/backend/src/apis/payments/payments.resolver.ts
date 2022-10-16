import {
  ConflictException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/type/context';
import { IamportService } from '../iamport/iamport.service';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@Resolver()
export class PaymentsResolver {
  constructor(
    private readonly paymentsService: PaymentsService, //
    private readonly iamportService: IamportService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Payment)
  async createPayment(
    @Args('impUid') impUid: string,
    @Args({ name: 'amount', type: () => Int }) paymentAmount: number,
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    const access_Token = await this.iamportService.getToken();

    await this.iamportService.getPaymentData({
      access_Token,
      impUid,
    });

    const validPayment = await this.paymentsService.findStatus({ impUid });
    if (validPayment) throw new ConflictException('이미 추가된 결제건입니다.');

    return this.paymentsService.create({ impUid, paymentAmount, user });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Payment)
  async createCancel(
    @Args('impUid') impUid: string,
    @Args({ name: 'amount', type: () => Int }) paymentAmount: number,
    @Args('user') user: string,
  ) {
    const paymentInf = await this.paymentsService.findStatus({ impUid });
    if (!paymentInf)
      throw new UnprocessableEntityException('취소할 결제 내역이 없습니다.');

    const access_Token = await this.iamportService.getToken();

    const validCancel = await this.iamportService.getPaymentData({
      access_Token,
      impUid,
    });

    if (validCancel.data.response.status === 'cancelled')
      throw new ConflictException('이미 결제가 취소되었습니다.');

    await this.iamportService.cancelPayment({
      access_Token,
      impUid,
      paymentAmount,
    });

    return this.paymentsService.createCancel({
      impUid,
      paymentAmount,
      user,
    });
  }
}
