import { InputType, OmitType } from '@nestjs/graphql';
import { ProductDetail } from '../entities/productDetail.entity';

@InputType()
export class ProductDetailInput extends OmitType(
  ProductDetail,
  ['id'],
  InputType,
) {}
