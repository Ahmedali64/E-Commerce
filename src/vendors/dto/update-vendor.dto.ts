import { PartialType } from '@nestjs/mapped-types';
import { CreateVendorApplicationDto } from './create-vendor-application.dto';

export class UpdateVendorApplicationDto extends PartialType(
  CreateVendorApplicationDto,
) {}
