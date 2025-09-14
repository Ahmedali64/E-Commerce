import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
  ) {}

  // Create Products
  async create(createProductDto: CreateProductDto): Promise<Products> {
    // Check unique fields
    const existingSku = await this.productRepo.findOne({
      where: { sku: createProductDto.sku },
    });
    if (existingSku) {
      throw new ConflictException('Product with this SKU already exists');
    }

    const existingSlug = await this.productRepo.findOne({
      where: { slug: createProductDto.slug },
    });
    if (existingSlug) {
      throw new ConflictException('Product with this slug already exists');
    }

    // Make sure that compare price is higher than selling price
    if (
      createProductDto.comparePrice &&
      createProductDto.comparePrice <= createProductDto.price
    ) {
      throw new BadRequestException(
        'Compare price must be higher than selling price',
      );
    }

    const product = this.productRepo.create(createProductDto);
    return await this.productRepo.save(product);
  }

  // Get products with filtering, search, sorting, and pagination
  async findAll(query: ProductQueryDto) {
    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      search,
      sort = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 20,
      vendorId,
      isFeatured,
      isActive = true,
    } = query;

    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.vendor', 'vendor')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images');

    // safe placeholder :isActive for sql injection
    queryBuilder.where('product.isActive= :isActive', { isActive });

    // Handel 2 cases 1- front send category name 2- front send category id
    // %% are wildcard search means it will get any product that has for ex Food on it if he send Food
    if (category) {
      queryBuilder.andWhere(
        '(category.name ILIKE :category OR category.id = :categoryId)',
        { category: `%${category}%`, categoryId: category },
      );
    }

    // Filter by price max/min
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Filter by inStock or no
    if (inStock !== undefined) {
      if (inStock) {
        queryBuilder.andWhere('product.stockQuantity > 0');
      } else {
        queryBuilder.andWhere('product.stockQuantity = 0');
      }
    }

    // Vendor filter
    if (vendorId) {
      queryBuilder.andWhere('product.vendorId = :vendorId', { vendorId });
    }

    // Featured filter
    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    // Search functionality (name, description, SKU)
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    const validSortFields = [
      'price',
      'createdAt',
      'name',
      'stockQuantity',
      'isFeatured',
    ];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    // We did not use placeholder here cause we are cheking on the value before we use it
    queryBuilder.orderBy(`product.${sortField}`, order);

    // Add secondary sort by createdAt why? cause if let's say 2 products has same price it will appear differently each time
    // so we are just saying if our sort cons are equal just sort by this
    if (sortField !== 'createdAt') {
      queryBuilder.addOrderBy('product.createdAt', 'DESC');
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query with count
    const [products, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Get featured products
  async findFeatured(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    return await this.productRepo.find({
      where: {
        isFeatured: true,
        isActive: true,
      },
      relations: ['vendor', 'category', 'images'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });
  }

  // Get products by vendor
  async findByVendor(vendorId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [products, total] = await this.productRepo.findAndCount({
      where: {
        vendorId,
        isActive: true,
      },
      relations: ['vendor', 'category', 'images'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Get products by category
  async findByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const offset = (page - 1) * limit;

    const [products, total] = await this.productRepo.findAndCount({
      where: {
        categoryId,
        isActive: true,
      },
      relations: ['vendor', 'category', 'images'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });
    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Get single product by ID
  async findOne(id: string): Promise<Products> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['vendor', 'category', 'images'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Get product by slug (for SEO-friendly URLs)
  async findBySlug(slug: string): Promise<Products> {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: ['vendor', 'category', 'images'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Update product
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Products> {
    const product = await this.findOne(id);

    // Check SKU uniqueness if updating SKU
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepo.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existingSku) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Check slug uniqueness if updating slug
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingSlug = await this.productRepo.findOne({
        where: { slug: updateProductDto.slug },
      });
      if (existingSlug) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    // Validate price logic if updating prices
    // If price is null or undefined use product.price
    const newPrice = updateProductDto.price ?? product.price;
    const newComparePrice =
      updateProductDto.comparePrice ?? product.comparePrice;
    if (newComparePrice && newComparePrice <= newPrice) {
      throw new BadRequestException(
        'Compare price must be higher than selling price',
      );
    }

    // Update product
    Object.assign(product, updateProductDto);
    return await this.productRepo.save(product);
  }

  // Soft delete product (set inactive)
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productRepo.save(product);
  }

  // Hard delete product (admin only)
  async delete(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
  }

  // Update stock quantity
  async updateStock(id: string, quantity: number): Promise<Products> {
    const product = await this.findOne(id);

    if (quantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    product.stockQuantity = quantity;
    return await this.productRepo.save(product);
  }

  // Check if product is low stock
  async checkLowStock(): Promise<Products[]> {
    return await this.productRepo
      .createQueryBuilder('product')
      .where('product.stockQuantity <= product.lowStockThreshold')
      .andWhere('product.isActive = true')
      .getMany();
  }
}
