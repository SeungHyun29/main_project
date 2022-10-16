import { Field, InputType, Int } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { ProductDetailInput } from 'src/apis/productsDetails/dto/productDetail.input';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  expDetail: string;

  @Min(0)
  @Field(() => Int)
  price: number;

  @Field(() => [String], { nullable: true })
  imageUrl: string[];

  @Field(() => ProductDetailInput)
  productDetail: ProductDetailInput;

  @Field(() => String)
  productSubCategoryId: string;

  @Field(() => [String])
  hamsters: string[];
}
