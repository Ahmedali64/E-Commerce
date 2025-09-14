import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Products } from '../../products/entities/products.entity';

export enum BusinessType {
  INDIVIDUAL = 'individual',
  CORPORATION = 'corporation',
  LLC = 'llc',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
}

export enum VendorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
}

@Entity('vendors')
export class Vendors extends BaseEntity {
  @ApiProperty({
    description: 'User ID associated with this vendor account',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @Column({
    type: 'uuid',
    unique: true,
    name: 'user_id',
  })
  userId: string;

  @ApiProperty({
    description: 'Official business name',
    example: 'Tech Solutions Inc.',
  })
  @Column({
    type: 'varchar',
    length: 255,
    name: 'business_name',
  })
  businessName: string;

  @ApiProperty({
    description: 'Type of business entity',
    enum: BusinessType,
    example: BusinessType.CORPORATION,
  })
  @Column({
    type: 'enum',
    enum: BusinessType,
    name: 'business_type',
  })
  businessType: BusinessType;

  @ApiPropertyOptional({
    description: 'Business tax identification number',
    example: '12-3456789',
  })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'tax_id',
  })
  taxId?: string;

  @ApiProperty({
    description: 'Business address as JSON object',
    example: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
  })
  @Column({
    type: 'json',
    name: 'business_address',
  })
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @ApiProperty({
    description: 'Primary contact email for the vendor',
    example: 'contact@techsolutions.com',
  })
  @Column({
    type: 'varchar',
    length: 255,
    name: 'contact_email',
  })
  contactEmail: string;

  @ApiProperty({
    description: 'Primary contact phone number',
    example: '+201012345678',
  })
  @Column({
    type: 'varchar',
    length: 20,
    name: 'contact_phone',
  })
  contactPhone: string;

  @ApiPropertyOptional({
    description: 'Business description and information',
    example:
      'Leading provider of innovative technology solutions for small and medium businesses.',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL or path to business logo image',
    example: '/uploads/vendor-logos/tech-solutions-logo.png',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  logo?: string;

  @ApiPropertyOptional({
    description: 'Business website URL',
    example: 'https://www.techsolutions.com',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  website?: string;

  @ApiProperty({
    description: 'Current vendor status',
    enum: VendorStatus,
    example: VendorStatus.APPROVED,
  })
  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  status: VendorStatus;

  @ApiProperty({
    description: 'Commission rate percentage (0.00 to 100.00)',
    example: 15.5,
  })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'commission_rate',
  })
  commissionRate: number;

  @ApiProperty({
    description: 'Payment information as JSON object',
    example: {
      accountType: 'bank',
      accountNumber: '****1234',
      routingNumber: '021000021',
      accountHolder: 'Tech Solutions Inc.',
    },
  })
  @Column({
    type: 'json',
    name: 'payment_info',
  })
  paymentInfo: {
    accountType: string;
    accountNumber: string;
    routingNumber?: string;
    accountHolder: string;
  };

  @ApiProperty({
    description: 'Whether the vendor account is active',
    example: true,
  })
  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp when the vendor was approved',
    example: '2023-12-15T10:30:00Z',
  })
  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'approved_at',
  })
  approvedAt?: Date;

  // Relations

  // Vendor → Products (One-to-Many)
  @OneToMany(() => Products, (product) => product.vendor, {
    cascade: true,
  })
  products: Products[];
}
