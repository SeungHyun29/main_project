import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductImage } from './entites/productImage.entity';

@Injectable()
export class ProductImageService {
  constructor(
    private readonly productImageRepository: Repository<ProductImage>, //
  ) {}
  async createImage({ productImage, product }) {
    const result = await Promise.all(
      productImage.map(
        (el) =>
          new Promise((resolve) => {
            const results = this.productImageRepository.save({
              url: el,
              product,
            });
            resolve(results);
          }),
      ),
    );
    return result;
  }

  async updateImage({ productImage, product }) {
    const findProductId = await this.productImageRepository.find({
      where: { product: { id: product.id } },
    });

    await this.productImageRepository.delete({
      product: { id: product.id },
    });

    const result = await Promise.all(
      productImage.map(
        (el) =>
          new Promise((resolve) => {
            const result = this.productImageRepository.save({
              url: el,
              product: product,
            });
            resolve(result);
          }),
      ),
    );

    return result;
  }

  async findImageAll({ productImage }) {
    return productImage.map((el) => el.url);
  }
}
