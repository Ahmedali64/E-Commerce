import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  IsUrl,
  IsNumber,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessType } from '../entities/vendors.entity';

// Address DTO
class BusinessAddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Business Street',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  street: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'NY',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'ZIP/Postal code',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  country: string;
}

// PaymentInfo DTO
class PaymentInfoDto {
  @ApiProperty({
    description: 'Account type',
    example: 'bank',
  })
  @IsString()
  @IsNotEmpty()
  accountType: string;

  @ApiProperty({
    description: 'Account number (masked)',
    example: '****1234',
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiPropertyOptional({
    description: 'Routing number',
    example: '021000021',
  })
  @IsOptional()
  @IsString()
  routingNumber?: string;

  @ApiProperty({
    description: 'Account holder name',
    example: 'Tech Solutions Inc.',
  })
  @IsString()
  @IsNotEmpty()
  accountHolder: string;
}

export class CreateVendorApplicationDto {
  @ApiProperty({
    description: 'Official business name',
    example: 'Tech Solutions Inc.',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  businessName: string;

  @ApiProperty({
    description: 'Type of business entity',
    enum: BusinessType,
    example: BusinessType.CORPORATION,
  })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiPropertyOptional({
    description: 'Business tax identification number',
    example: '12-3456789',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  taxId?: string;

  @ApiProperty({
    description: 'Business address',
    type: BusinessAddressDto,
  })
  @ValidateNested()
  @Type(() => BusinessAddressDto)
  businessAddress: BusinessAddressDto;

  @ApiProperty({
    description: 'Primary contact email for the vendor',
    example: 'contact@techsolutions.com',
  })
  @IsEmail()
  @MaxLength(255)
  contactEmail: string;

  @ApiProperty({
    description: 'Primary contact phone number',
    example: '+201024567890',
  })
  @IsPhoneNumber()
  @MaxLength(20)
  contactPhone: string;

  @ApiPropertyOptional({
    description: 'Business description and information',
    example:
      'Leading provider of innovative technology solutions for small and medium businesses.',
  })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Business logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsUrl()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({
    description: 'Business website URL',
    example: 'https://www.techsolutions.com',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @ApiProperty({
    description: 'Commission rate percentage (0.00 to 100.00)',
    example: 15.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  commissionRate: number;

  @ApiProperty({
    description: 'Payment information',
    type: PaymentInfoDto,
  })
  @ValidateNested()
  @Type(() => PaymentInfoDto)
  paymentInfo: PaymentInfoDto;
}
