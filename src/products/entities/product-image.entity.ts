import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Products } from '../../products/entities/products.entity';

@Entity('product_images')
export class ProductImages extends BaseEntity {
  @ApiProperty({
    description: 'URL or path to the product image',
    example: '/uploads/products/wireless-headphones-front.jpg',
  })
  @Column({ type: 'varchar', length: 500, name: 'image_url' })
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Alternative text for the image (for accessibility)',
    example: 'Wireless Bluetooth Headphones - Front View',
  })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'alt_text' })
  altText?: string;

  @ApiProperty({
    description: 'Sort order for displaying images (0 = first)',
    example: 0,
  })
  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @ApiProperty({
    description: 'Whether this is the primary/main product image',
    example: true,
  })
  @Column({ type: 'boolean', default: false, name: 'is_primary' })
  isPrimary: boolean;

  @ApiProperty({
    description: 'ID of the product this image belongs to',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  // Relations

  // ProductImages → Product (Many-to-One)
  @ManyToOne(() => Products, (product) => product.images)
  @JoinColumn({ name: 'product_id' })
  product: Products;
}
