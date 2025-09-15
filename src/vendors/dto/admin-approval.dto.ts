import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

// DTO for admin approval
export class ApproveVendorDto {
  @ApiPropertyOptional({
    description:
      'Final commission rate set by admin (overrides vendor request)',
    example: 12.5,
    minimum: 0,
    maximum: 50,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(50)
  @IsOptional()
  commissionRate?: number;

  @ApiPropertyOptional({
    description: 'Admin notes for approval',
    example: 'Vendor meets all requirements',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  adminNotes?: string;
}
