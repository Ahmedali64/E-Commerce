import { ApiProperty } from '@nestjs/swagger';
import { Categories } from '../entities/categories.entity';

// Response DTOs for Swagger documentation
export class CategoryTreeResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Categories] })
  data: Categories[];
}

// Getting all categories
export class CategoryListResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Categories] })
  data: Categories[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class CategoryResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: Categories;
}

export class CategoryCreateResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Category created successfully' })
  message: string;

  @ApiProperty()
  data: Categories;
}

export class ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Category not found' })
  message: string;

  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/categories' })
  path: string;
}
