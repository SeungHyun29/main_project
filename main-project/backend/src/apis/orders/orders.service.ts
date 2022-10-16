import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { Order } from './entity/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createOrder({ createOrderInput }) {
    const { productId, userId, cs, quantity, orderNumber } = createOrderInput;

    const result = await this.ordersRepository.save({
      product: { id: productId },
      userId: { id: userId },
      cs,
      quantity,
      orderNumber,
    });

    return result;
  }

  async updateOrder({ paymentId }) {
    const myOrder = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    const result2 = this.ordersRepository.save({
      ...myOrder,
    });
    return result2;
  }
}
