import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hamster } from '../Hamsters/entites/Hamster.entity';
import { ProductDetail } from '../productsDetails/entities/productDetail.entity';
import { ProductImage } from '../productsImages/entites/productImage.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>,

    @InjectRepository(Hamster)
    private readonly hamsterRepository: Repository<Hamster>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async findAll() {
    return await this.productRepository.find({
      relations: ['productDetail', 'productSubCategory', 'hamsters'],
    });
  }

  async findOne({ productId }) {
    return await this.productRepository.findOne({
      where: { id: productId },
      relations: ['productDetail', 'productSubCategory', 'hamsters'],
    });
  }

  async WithDelete() {
    return await this.productRepository.find({
      relations: ['productDetail', 'productSubCategory', 'hamsters'],
      withDeleted: true,
    });
  }

  async create({ createProductInput }) {
    const {
      imageUrl,
      productDetail,
      productSubCategoryId,
      hamsters,
      ...product
    } = createProductInput;

    console.log(product);

    const result = await this.productDetailRepository.save({
      // 스프레드 연산자를 사용해서 저장하기
      // ...createProductInput.productSaleslocation
      ...productDetail,
    });

    const hamsterresult = [];
    for (let i = 0; i < hamsters.length; i++) {
      const hamstername = hamsters[i];

      const prevHamster = await this.productRepository.findOne({
        where: { name: hamstername },
      });

      // 기존에 태그가 존재한다면
      if (prevHamster) {
        hamsterresult.push(prevHamster);
        // 기존에 태그가 없었다면
      } else {
        const newHamster = await this.hamsterRepository.save({
          name: hamstername,
        });
        hamsterresult.push(newHamster);
      }
    }

    const result2 = await this.productRepository.save({
      ...product,
      productDetail: result, // result 통째로 넣기 vs id만 넣기
      productSubCategory: { id: productSubCategoryId },
      hamsters: hamsterresult,
    });

    await Promise.all(
      imageUrl.map(
        (el) =>
          new Promise((resolve, reject) => {
            this.productImageRepository.save({
              url: el,
              product: { id: result2.id },
            });
            resolve('이미지 저장 완료');
            reject('이미지 저장 실패');
          }),
      ),
    );

    await this.productImageRepository.save({
      url: imageUrl,
      product: { id: result2.id },
    });

    return result2;
  }

  async update({ productId, updateProductInput }) {
    const { imageUrl, ...product } = updateProductInput;

    // 수정 후 결과값까지 받을 때 사용
    const myproduct = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!myproduct) {
      throw new UnprocessableEntityException('상품이 존재하지 않습니다.');
    }

    const _imageUrl = await this.productImageRepository.find({
      where: { id: product.id },
    });

    await Promise.all(
      _imageUrl.map(
        (el) =>
          new Promise((resolve) => {
            this.productImageRepository.softDelete({ id: el.id });
            resolve('이미지 삭제 완료');
          }),
      ),
    );

    await Promise.all(
      _imageUrl.map(
        (el) =>
          new Promise((resolve) => {
            this.productImageRepository.save({
              url: el.url,
              product: { id: myproduct.id },
            });
            resolve('이미지 저장 완료');
          }),
      ),
    );

    const result = this.productRepository.save({
      ...myproduct,
      id: productId,
      ...updateProductInput,
    });
    return result;
  }

  async delete({ productId }) {
    const result = await this.productRepository.softDelete({ id: productId });
    return result.affected ? true : false;
  }

  async restore({ productId }) {
    const result = await this.productRepository.restore({ id: productId });
    return result.affected ? true : false;
  }

  async checkSoldout({ productId }) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (product.isSoldout)
      throw new UnprocessableEntityException('이미 판매 완료된 상품입니다.');
  }
}
