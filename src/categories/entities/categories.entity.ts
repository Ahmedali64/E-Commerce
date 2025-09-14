import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Products } from '../../products/entities/products.entity';

@Entity('categories')
@Index(['parentId'])
@Index(['slug'])
@Index(['sortOrder'])
export class Categories extends BaseEntity {
  @ApiProperty({
    description: 'Category name',
    example: 'Gaming Laptops',
    maxLength: 100,
  })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly category identifier',
    example: 'gaming-laptops',
    maxLength: 100,
  })
  @Column({
    type: 'varchar',
    length: 100,
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'High-performance laptops designed for gaming enthusiasts',
    nullable: true,
    maxLength: 1000,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Parent category ID',
    example: '456e7890-e89b-12d3-a456-426614174111',
    format: 'uuid',
    nullable: true,
  })
  @Column({
    name: 'parent_id',
    type: 'uuid',
    nullable: true,
  })
  parentId: string | null;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/images/gaming-laptops.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Whether the category is active and visible to users',
    example: true,
    default: true,
  })
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Sort order for category display (lower numbers appear first)',
    example: 1,
    default: 0,
  })
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  //It's a number that controls the order categories appear in the ui added by the admin to add like some prio for best selling categories
  sortOrder: number;

  // Relations

  @ManyToOne(() => Categories, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Categories | null;

  @OneToMany(() => Categories, (category) => category.parent, {
    cascade: true,
  })
  children: Categories[];

  // Category → Product (One-to-Many)
  @OneToMany(() => Products, (product) => product.category)
  products: Products[];

  get isRoot(): boolean {
    return this.parentId === null;
  }

  get isLeaf(): boolean {
    return !this.children || this.children.length === 0;
  }
  // {parent > child > child and so on}
  getHierarchyPath(): string {
    const path: string[] = [this.name];
    let current = this.parent;

    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }

    return path.join(' > ');
  }
}
