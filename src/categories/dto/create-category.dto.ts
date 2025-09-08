import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Gaming Laptops',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description:
      'URL-friendly category identifier (lowercase, numbers, hyphens only)',
    example: 'gaming-laptops',
    pattern: '^[a-z0-9-]+$',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'High-performance laptops designed for gaming enthusiasts',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID (UUID). Leave empty for root categories.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/images/gaming-laptops.jpg',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @Length(0, 255)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Sort order for category display (lower numbers appear first)',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value) : 0))
  sortOrder?: number;
}
