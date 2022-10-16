import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CreateProductInput } from './dto/createProduct.input';
import { UpdateProductInput } from './dto/updateProduct.input';
import { Product } from './entities/product.entity';
import { ProductService } from './products.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Resolver()
export class ProductResolver {
  constructor(
    private readonly productService: ProductService, //

    private readonly elasticsearchService: ElasticsearchService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  @Query(() => [Product])
  async fetchProducts(
    @Args({ name: 'search', nullable: true }) search: string, //
  ) {
    // 1. redis에 있는지 확인
    const checkRedis = await this.cacheManager.get(search);

    // 2. 있으면 클라이언트에 결과 반환
    if (checkRedis) {
      return checkRedis;
    } else {
      // 3. 없으면 elasticsearch로 검색
      const result = await this.elasticsearchService.search({
        index: 'search-product', // 인덱스는 컬렉션명
        query: {
          bool: {
            should: [{ prefix: { name: search.toLowerCase() } }],
          },

          // term: { name: search.toLowerCase() },
        },
      });

      console.log('==============', JSON.stringify(result, null, ' '));

      const arrayProduct = result.hits.hits.map((el) => {
        const obj = {
          id: el._source['id'],
          name: el._source['name'],
          price: el._source['price'],
        };
        return obj;
      });

      // 4. redis에 저장
      await this.cacheManager.set(search, arrayProduct, { ttl: 3000 });

      return arrayProduct;
    }
    // return this.productService.findAll();
  }

  @Query(() => Product)
  fetchProduct(
    @Args('productId') productId: string, //
  ) {
    return this.productService.findOne({ productId });
  }

  @Query(() => [Product])
  fetchWithDeleted() {
    return this.productService.WithDelete();
  }

  @Mutation(() => Product)
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput, //
  ) {
    return this.productService.create({ createProductInput });
  }

  @Mutation(() => Product)
  async updateProduct(
    @Args('productId') productId: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput, //
  ) {
    // 판매 완료가 되었는지 확인해 보기
    await this.productService.checkSoldout({ productId });

    // 수정하기
    return this.productService.update({ productId, updateProductInput });
  }

  @Mutation(() => Boolean)
  deleteProduct(
    @Args('productId') productId: string, //
  ) {
    return this.productService.delete({ productId });
  }

  @Mutation(() => Boolean)
  restoreProduct(
    @Args('productId') productId: string, //
  ) {
    return this.productService.restore({ productId });
  }
}
