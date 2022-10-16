import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderInput } from './dto/createOrder.input';
import { Order } from './entity/order.entity';
import { OrderService } from './orders.service';

@Resolver()
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService, //
    private readonly paymentService: PaymentsService,
  ) {}

  @Mutation(() => Order)
  async createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput, //
    @Args('impUid') impUid: string,
    @Args('paymentId') paymentId: string,
  ) {
    // 결제한 내역이 있는지 확인하기
    const checkPayment = await this.paymentService.findStatus({ impUid });
    {
      if (!checkPayment) this.orderService.createOrder({ createOrderInput });

      if (checkPayment) this.orderService.updateOrder({ paymentId });
    }
    return checkPayment;
  }
}
