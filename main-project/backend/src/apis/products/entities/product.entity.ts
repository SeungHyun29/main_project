import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Hamster } from 'src/apis/Hamsters/entites/Hamster.entity';
import { ProductDetail } from 'src/apis/productsDetails/entities/productDetail.entity';
import { ProductImage } from 'src/apis/productsImages/entites/productImage.entity';
import { ProductSubCategory } from 'src/apis/productsSubCategories/entites/productSubCategory.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ unique: true })
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => Int)
  price: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  expDetail: string;

  @Column({ default: false })
  @Field(() => Boolean)
  isSoldout: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ProductSubCategory)
  @Field(() => ProductSubCategory)
  productSubCategory: ProductSubCategory;

  @JoinColumn()
  @OneToOne(() => ProductDetail)
  @Field(() => ProductDetail)
  productDetail: ProductDetail;

  @JoinTable()
  @ManyToMany(() => Hamster, (hamsters) => hamsters.products)
  @Field(() => [Hamster])
  hamsters: Hamster[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  @Field(() => [String])
  productImage: string[];
}
