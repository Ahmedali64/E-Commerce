import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Vendors } from '../../vendors/entities/vendors.entity';
import { Categories } from '../../categories/entities/categories.entity';
import { ProductImages } from './product-image.entity';

@Entity('products')
@Index(['price'])
@Index(['categoryId'])
@Index(['vendorId'])
export class Products extends BaseEntity {
  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Bluetooth Headphones',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly version of the product name',
    example: 'wireless-bluetooth-headphones',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  slug: string;

  @ApiProperty({
    description: 'Detailed product description',
    example:
      'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal clear sound quality. Perfect for music lovers and professionals.',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Brief product summary',
    example:
      'Premium wireless headphones with noise cancellation and 30-hour battery',
    maxLength: 500,
  })
  @Column({ type: 'varchar', length: 500, name: 'short_description' })
  shortDescription: string;

  @ApiProperty({
    description: 'Stock Keeping Unit - unique product identifier',
    example: 'APPLE-IPH15-128-BLK',
    maxLength: 100,
  })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  sku: string;

  @ApiProperty({
    description: 'Product selling price',
    example: 299.99,
    type: 'number',
    format: 'decimal',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @ApiProperty({
    description: 'Compare at price (original/MSRP price for showing discounts)',
    example: 399.99,
    type: 'number',
    format: 'decimal',
    required: false,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'compare_price',
  })
  comparePrice?: number;

  @ApiProperty({
    description: 'Cost price for internal calculations',
    example: 150.0,
    type: 'number',
    format: 'decimal',
    required: false,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'cost_price',
  })
  costPrice?: number;

  @ApiProperty({
    description: 'Current stock quantity',
    example: 150,
    minimum: 0,
  })
  @Column({
    type: 'int',
    name: 'stock_quantity',
  })
  stockQuantity: number;

  @ApiProperty({
    description: 'Stock level that triggers low stock warning',
    example: 10,
    minimum: 0,
  })
  @Column({
    type: 'int',
    name: 'low_stock_threshold',
  })
  lowStockThreshold: number;

  @ApiProperty({
    description: 'Product weight in kilograms',
    example: 0.45,
    type: 'number',
    format: 'decimal',
    required: false,
  })
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product dimensions as JSON object',
    example: { length: 20.5, width: 18.2, height: 8.5, unit: 'cm' },
  })
  @Column({ type: 'json', nullable: true })
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
  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the product is featured on homepage/promotions',
    example: false,
  })
  @Column({
    type: 'boolean',
    default: false,
    name: 'is_featured',
  })
  isFeatured: boolean;

  @ApiProperty({
    description: 'ID of the vendor selling this product',
    example: 1,
  })
  @Column({
    type: 'uuid',
    name: 'vendor_id',
  })
  vendorId: string;

  @ApiProperty({
    description: 'ID of the product category',
    example: 3,
  })
  @Column({
    type: 'uuid',
    name: 'category_id',
  })
  categoryId: string;

  // Relations

  // Product → Vendor (Many-to-One)
  @ManyToOne(() => Vendors, (vendors) => vendors.products)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendors;

  // Product → Category (Many-to-One)
  @ManyToOne(() => Categories, (categories) => categories.products)
  @JoinColumn({ name: 'categoryId' })
  category: Categories;

  // Product → ProductImages (One-to-Many)
  @OneToMany(() => ProductImages, (images) => images.product)
  images: ProductImages[];
}
