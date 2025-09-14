import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Products } from './entities/products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

// I was thinking to make all the routes need auth but i will use it on spacific routes only just in case guest wanna see some products only
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({
    type: CreateProductDto,
    description: 'Example payload for creating a new product',
    examples: {
      product: {
        summary: 'Example Product',
        value: {
          name: 'Wireless Gaming Mouse',
          slug: 'wireless-gaming-mouse',
          description:
            'A high-precision wireless mouse with customizable RGB lighting',
          price: 59.99,
          comparePrice: 79.99,
          stockQuantity: 150,
          isFeatured: true,
          isActive: true,
          vendorId: '123e4567-e89b-12d3-a456-426614174000',
          categoryId: '987e6543-e21b-65d3-a456-426614174999',
          images: [
            {
              url: 'https://example.com/images/mouse-front.jpg',
              alt: 'Front view of wireless gaming mouse',
            },
            {
              url: 'https://example.com/images/mouse-side.jpg',
              alt: 'Side view of wireless gaming mouse',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    type: Products,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'SKU or slug already exists',
  })
  @UseGuards(AuthenticatedGuard, AdminGuard)
  async create(@Body() createProductDto: CreateProductDto): Promise<Products> {
    this.logger.log(
      `Creating product: ${createProductDto.name}, slug: ${createProductDto.slug}`,
    );
    const product = await this.productsService.create(createProductDto);
    this.logger.log(`Product created successfully with ID: ${product.id}`);
    return product;
  }
  @Get()
  @ApiOperation({
    summary: 'Get all products with filtering, search, and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Products' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category name or ID',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'Filter by stock availability',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in name, description, and SKU',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['price', 'createdAt', 'name', 'stockQuantity', 'isFeatured'],
  })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'vendorId',
    required: false,
    description: 'Filter by vendor ID',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    type: Boolean,
    description: 'Filter featured products',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter active products',
  })
  async findAll(@Query() query: ProductQueryDto) {
    this.logger.log(
      `Fetching all products with filters: ${JSON.stringify(query)}`,
    );
    const result = await this.productsService.findAll(query);
    this.logger.log(`Fetched ${result.data.length} products`);
    return result;
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Featured products retrieved successfully',
    type: [Products],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of featured products to return (default: 10)',
  })
  async findFeatured(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Products[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    this.logger.log(`Fetching featured products (limit: ${parsedLimit})`);
    const products = await this.productsService.findFeatured(parsedLimit);
    this.logger.log(`Fetched ${products.length} featured products`);
    return products;
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get products by vendor' })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Products' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  async findByVendor(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    this.logger.log(
      `Fetching products by vendor: ${vendorId}, page: ${parsedPage}, limit: ${parsedLimit}`,
    );
    const result = await this.productsService.findByVendor(
      vendorId,
      parsedPage,
      parsedLimit,
    );
    this.logger.log(
      `Fetched ${result.data.length} products for vendor: ${vendorId}`,
    );
    return result;
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Products' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  async findByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    this.logger.log(
      `Fetching products by category: ${categoryId}, page: ${parsedPage}, limit: ${parsedLimit}`,
    );
    const result = await this.productsService.findByCategory(
      categoryId,
      parsedPage,
      parsedLimit,
    );
    this.logger.log(
      `Fetched ${result.data.length} products for category: ${categoryId}`,
    );
    return result;
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug (SEO-friendly URL)' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: Products,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Products> {
    this.logger.log(`Fetching product by slug: ${slug}`);
    const product = await this.productsService.findBySlug(slug);
    this.logger.log(`Fetched product: ${product?.id ?? 'NOT FOUND'}`);
    return product;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: Products,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Products> {
    this.logger.log(`Fetching product by ID: ${id}`);
    const product = await this.productsService.findOne(id);
    this.logger.log(`Fetched product: ${product?.id ?? 'NOT FOUND'}`);
    return product;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    type: Products,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'SKU or slug already exists',
  })
  @UseGuards(AuthenticatedGuard, AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Products> {
    this.logger.log(
      `Updating product ${id} with data: ${JSON.stringify(updateProductDto)}`,
    );
    const updated = await this.productsService.update(id, updateProductDto);
    this.logger.log(`Product ${id} updated successfully`);
    return updated;
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock quantity' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock updated successfully',
    type: Products,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid stock quantity',
  })
  @UseGuards(AuthenticatedGuard, AdminGuard)
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
  ): Promise<Products> {
    this.logger.log(
      `Updating stock for product ${id} to quantity: ${quantity}`,
    );
    const updated = await this.productsService.updateStock(id, quantity);
    this.logger.log(`Product ${id} stock updated successfully`);
    return updated;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete product (set inactive)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product deactivated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard, AdminGuard)
  async softDelete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.warn(`Soft deleting product: ${id}`);
    await this.productsService.remove(id);
    this.logger.log(`Product ${id} soft deleted successfully`);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete product (admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product permanently deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard, AdminGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.error(`Permanently deleting product: ${id}`);
    await this.productsService.delete(id);
    this.logger.log(`Product ${id} permanently deleted successfully`);
  }

  @Get('admin/low-stock')
  @ApiOperation({ summary: 'Get products with low stock (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Low stock products retrieved successfully',
    type: [Products],
  })
  @UseGuards(AuthenticatedGuard, AdminGuard)
  async getLowStockProducts(): Promise<Products[]> {
    this.logger.log(`Fetching low stock products`);
    const products = await this.productsService.checkLowStock();
    this.logger.log(`Fetched ${products.length} low stock products`);
    return products;
  }
}
