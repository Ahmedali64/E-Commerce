import {
  IsBoolean,
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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Gaming & Entertainment Laptops',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({
    description:
      'URL-friendly category identifier (lowercase, numbers, hyphens only)',
    example: 'gaming-entertainment-laptops',
    pattern: '^[a-z0-9-]+$',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Premium laptops for gaming and creative work',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({
    description:
      'Parent category ID (UUID). Set to null to make it a root category.',
    example: '456e7890-e89b-12d3-a456-426614174111',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/images/updated-laptops.jpg',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @Length(0, 255)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Sort order for category display (lower numbers appear first)',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value) : 0))
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the category is active and visible to users',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
