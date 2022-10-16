import { Field, InputType, Int } from '@nestjs/graphql';
import { Min } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @Field(() => String)
  cs: string;

  @Min(0)
  @Field(() => Int)
  quantity: number;

  @Field(() => String)
  orderNumber: string;

  @Field(() => String)
  productId: string;

  @Field(() => String)
  userId: string;
}
