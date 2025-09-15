import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType } from '../entities/vendors.entity';

// Response DTOs
export class VendorApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty({ enum: BusinessType })
  businessType: BusinessType;

  @ApiProperty()
  contactEmail: string;

  @ApiProperty()
  contactPhone: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  commissionRate: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  approvedAt?: Date;
}
