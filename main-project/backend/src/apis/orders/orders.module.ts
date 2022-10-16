import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentsService } from '../payments/payments.service';
import { User } from '../users/entities/user.entity';
import { Order } from './entity/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, //
      User,
      Payment,
    ]),
  ],
  providers: [
    OrderResolver, //
    OrderService,
    PaymentsService,
  ],
})
export class OrdersModule {}
