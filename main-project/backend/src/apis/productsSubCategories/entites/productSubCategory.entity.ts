import { Field, ObjectType } from '@nestjs/graphql';
import { ProductMainCategory } from 'src/apis/productsMainCategories/entites/productMainCategory.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
@ObjectType()
export class ProductSubCategory {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  @ManyToOne(() => ProductMainCategory)
  @Field(() => ProductMainCategory)
  productMainCategory: ProductMainCategory;
}
