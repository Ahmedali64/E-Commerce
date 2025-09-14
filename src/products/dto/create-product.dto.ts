import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
  IsInt,
  IsObject,
} from 'class-validator';

// DTO for creating products
export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Bluetooth Headphones',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'URL-friendly version of the product name',
    example: 'wireless-bluetooth-headphones',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    description: 'Detailed product description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Brief product summary',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  shortDescription: string;

  @ApiProperty({
    description: 'Stock Keeping Unit - unique product identifier',
    example: 'WBH-001-BLK',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string;

  @ApiProperty({
    description: 'Product selling price',
    example: 299.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Compare at price (original/MSRP price for showing discounts)',
    example: 399.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  comparePrice?: number;

  @ApiPropertyOptional({
    description: 'Cost price for internal calculations',
    example: 150.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiProperty({
    description: 'Current stock quantity',
    example: 150,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({
    description: 'Stock level that triggers low stock warning',
    example: 10,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  lowStockThreshold: number;

  @ApiPropertyOptional({
    description: 'Product weight in kilograms',
    example: 0.45,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product dimensions as JSON object',
    example: { length: 20.5, width: 18.2, height: 8.5, unit: 'cm' },
  })
  @IsOptional()
  @IsObject()
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };

  @ApiProperty({
    description: 'Whether the product is active and available for sale',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the product is featured on homepage/promotions',
    example: false,
  })
  @IsBoolean()
  isFeatured: boolean;

  @ApiProperty({
    description: 'ID of the vendor selling this product',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  vendorId: string;

  @ApiProperty({
    description: 'ID of the product category',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsUUID()
  categoryId: string;
}
