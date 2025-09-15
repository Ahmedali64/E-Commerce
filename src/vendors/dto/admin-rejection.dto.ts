import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

// DTO for admin rejection
export class RejectVendorDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Incomplete business documentation',
  })
  @IsString()
  @Length(10, 500)
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional admin notes',
    example: 'Missing tax ID verification',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  adminNotes?: string;
}
