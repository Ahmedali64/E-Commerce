import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CategoriesService } from './categories.service';
import {
  CategoryCreateResponse,
  CategoryListResponse,
  CategoryResponse,
  CategoryTreeResponse,
  ErrorResponse,
} from './dto/swagger-responses.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Categories } from './entities/categories.entity';

@ApiTags('Categories')
@UseGuards(AuthenticatedGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly categoriesService: CategoriesService,
  ) {}
  // Get a categorie
  @Get('categories')
  @ApiOperation({
    summary: 'Get paginated categories list',
    description: 'Returns a flat list of categories with pagination support.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 100)',
    example: 10,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    type: CategoryListResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination parameters',
    type: ErrorResponse,
  })
  async categories(
    @Query() query: PaginationQueryDto,
  ): Promise<CategoryListResponse> {
    const { page = 1, limit = 10 } = query;
    const result = await this.categoriesService.findAll(page, limit);
    this.logger.log('Fetching categories');
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  // Create a categorie
  @Post()
  @ApiOperation({
    summary: 'Create new category (Admin only)',
    description:
      'Creates a new category. Requires admin authentication. Validates uniqueness of name and slug.',
  })
  @ApiBearerAuth('session') // For session-based auth
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category creation data',
    examples: {
      rootCategory: {
        summary: 'Root category example',
        value: {
          name: 'Electronics',
          slug: 'electronics',
          description: 'All electronic products and gadgets',
          imageUrl: 'https://example.com/electronics.jpg',
          // No partent id cause this is the parent so i will just leave it like this and the default value will be null auto
          sortOrder: 1,
        },
      },
      childCategory: {
        summary: 'Child category example',
        value: {
          name: 'Gaming Laptops',
          slug: 'gaming-laptops',
          description: 'High-performance laptops for gaming',
          parentId: '123e4567-e89b-12d3-a456-426614174000',
          sortOrder: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    type: CategoryCreateResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category name or slug already exists',
    type: ErrorResponse,
  })
  @UseGuards(AdminGuard)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryCreateResponse> {
    const category = await this.categoriesService.create(createCategoryDto);
    this.logger.log('Category created successfully');
    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  // Get the categoy tree
  @Get('tree')
  @ApiOperation({
    summary: 'Get category tree structure',
    description:
      'Returns all categories in a hierarchical tree structure. Categories are nested with their children and sorted by sortOrder and name.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category tree retrieved successfully',
    type: CategoryTreeResponse,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ErrorResponse,
  })
  async getTree(): Promise<CategoryTreeResponse> {
    const tree = await this.categoriesService.getTree();
    this.logger.log('Tree fetched successfully.');
    return {
      success: true,
      data: tree,
    };
  }

  // Get a category by a slug
  @Get(':slug')
  @ApiOperation({
    summary: 'Get category by slug',
    description:
      'Returns a single category by its URL-friendly slug. Includes breadcrumb navigation data.',
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-friendly category identifier',
    example: 'gaming-laptops',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category found successfully',
    type: CategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    type: ErrorResponse,
  })
  async findBySlug(@Param('slug') slug: string): Promise<CategoryResponse> {
    const category = await this.categoriesService.findBySlug(slug);
    this.logger.log(`Category with slug ${slug} fetched successfully.`);
    return {
      success: true,
      data: category,
    };
  }

  // Update category
  @Put(':id')
  @ApiOperation({
    summary: 'Update category (Admin only)',
    description:
      'Updates an existing category. Requires admin authentication. Validates against circular references and duplicate names/slugs.',
  })
  @ApiBearerAuth('session')
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Category update data (all fields optional)',
    examples: {
      updateName: {
        summary: 'Update name and slug',
        value: {
          name: 'Gaming & Entertainment',
          slug: 'gaming-entertainment',
        },
      },
      moveCategory: {
        summary: 'Move to different parent',
        value: {
          parentId: '456e7890-e89b-12d3-a456-426614174111',
        },
      },
      deactivate: {
        summary: 'Deactivate category',
        value: {
          isActive: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    type: CategoryCreateResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or circular reference detected',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category name or slug already exists',
    type: ErrorResponse,
  })
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryCreateResponse> {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    this.logger.log(`Categorie with id ${id} updated successfully.`);
    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  }
  // Get category children
  @Get(':id/children')
  @ApiOperation({
    summary: 'Get category children',
    description:
      'Returns direct children of a specific category. Useful for building dynamic navigation menus.',
  })
  @ApiParam({
    name: 'id',
    description: 'Parent category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Children categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: { $ref: getSchemaPath(Categories) } },
        parent: { $ref: getSchemaPath(Categories) },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parent category not found',
    type: ErrorResponse,
  })
  async getChildren(@Param('id', ParseUUIDPipe) id: string): Promise<{
    success: boolean;
    data: Categories[];
    parent: Categories;
  }> {
    const parent = await this.categoriesService.findOneById(id);
    const children = parent.children.filter((child) => child.isActive);
    this.logger.log(
      `Parent childrien Categories with id: ${id} fetched successfully.`,
    );
    return {
      success: true,
      data: children,
      parent: {
        ...parent,
        children: [],
        isRoot: false,
        isLeaf: false,
        getHierarchyPath: function (): string {
          throw new Error('Function not implemented.');
        },
      },
    };
  }
}
