import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { VendorsService } from './vendors.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { VendorApplicationResponseDto } from './dto/application-response.dto';
import { CreateVendorApplicationDto } from './dto/create-vendor-application.dto';
import { Vendors, VendorStatus } from './entities/vendors.entity';
import type { AuthenticatedRequest } from 'src/common/interfaces/req-user.interface';
import { UpdateVendorApplicationDto } from './dto/update-vendor.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { ApproveVendorDto } from './dto/admin-approval.dto';
import { RejectVendorDto } from './dto/admin-rejection.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Vendors')
@Controller('vendors')
@UseGuards(AuthenticatedGuard)
export class VendorsController {
  constructor(
    private readonly vendorService: VendorsService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post('application')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({
    summary: 'Submit vendor application',
    description: 'Submit a new vendor application. User must be authenticated.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vendor application submitted successfully',
    type: VendorApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already has a vendor account',
  })
  async submitApplication(
    @Body() createVendorDto: CreateVendorApplicationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Vendors> {
    const userId = req.user.id;
    this.logger.log(
      `User ${userId} is submitting a vendor application`,
      VendorsController.name,
    );
    return await this.vendorService.submitApplication(userId, createVendorDto);
  }

  @Get('application/my')
  @ApiOperation({
    summary: 'Get my vendor application',
    description: "Get current user's vendor application status",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor application retrieved successfully',
    type: VendorApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor application not found',
  })
  async getMyApplication(@Req() req: AuthenticatedRequest): Promise<Vendors> {
    const userId = req.user.id;
    this.logger.debug(
      `User ${userId} requested their vendor application`,
      VendorsController.name,
    );
    return await this.vendorService.getApplicationByUserId(userId);
  }

  @Patch('application/my')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({
    summary: 'Update my vendor application',
    description:
      'Update pending vendor application (only works for PENDING status)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor application updated successfully',
    type: VendorApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot update application after review',
  })
  async updateMyApplication(
    @Body() updateVendorDto: UpdateVendorApplicationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Vendors> {
    const userId = req.user.id;
    this.logger.log(
      `User ${userId} is updating their vendor application`,
      VendorsController.name,
    );
    return await this.vendorService.updateApplication(userId, updateVendorDto);
  }

  // Admin only routes
  @Get('applications/pending')
  @ApiOperation({
    summary: 'Get all pending applications (Admin only)',
    description: 'Retrieve all pending vendor applications for admin review',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending applications retrieved successfully',
    type: [VendorApplicationResponseDto],
  })
  @UseGuards(AdminGuard)
  async getPendingApplications(): Promise<Vendors[]> {
    this.logger.debug('Admin fetching pending vendor applications');
    return await this.vendorService.getPendingApplications();
  }

  @Post('applications/:id/approve')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({
    summary: 'Approve vendor application (Admin only)',
    description:
      'Approve a pending vendor application and activate the vendor account',
  })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor application approved successfully',
    type: VendorApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Can only approve pending applications',
  })
  @UseGuards(AdminGuard)
  async approveApplication(
    @Param('id', ParseUUIDPipe) vendorId: string,
    @Body() approveDto: ApproveVendorDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Vendors> {
    this.logger.warn(
      `Admin ${req.user.id} approved vendor application ${vendorId}`,
      VendorsController.name,
    );
    return await this.vendorService.approveApplication(vendorId, approveDto);
  }

  @Post('applications/:id/reject')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({
    summary: 'Reject vendor application (Admin only)',
    description: 'Reject a pending vendor application with reason',
  })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor application rejected successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
  })
  @UseGuards(AdminGuard)
  async rejectApplication(
    @Param('id', ParseUUIDPipe) vendorId: string,
    @Body() rejectDto: RejectVendorDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    this.logger.warn(
      `Admin ${req.user.id} rejected vendor application ${vendorId}`,
      VendorsController.name,
    );
    return await this.vendorService.rejectApplication(vendorId, rejectDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all vendors (Admin only)',
    description: 'Retrieve all vendors with optional status filtering',
  })
  @ApiQuery({
    name: 'status',
    enum: VendorStatus,
    required: false,
    description: 'Filter by vendor status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendors retrieved successfully',
    type: [VendorApplicationResponseDto],
  })
  @UseGuards(AdminGuard)
  async getAllVendors(
    @Query('status') status?: VendorStatus,
  ): Promise<Vendors[]> {
    this.logger.debug(
      `Admin fetching vendors with status filter: ${status || 'ALL'}`,
    );
    return await this.vendorService.getAllVendors(status);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get vendor statistics (Admin only)',
    description: 'Get vendor statistics including counts by status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor statistics retrieved successfully',
  })
  @UseGuards(AdminGuard)
  async getVendorStats() {
    this.logger.debug('Admin fetching vendor statistics');
    return await this.vendorService.getVendorStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get vendor by ID',
    description: 'Retrieve specific vendor information',
  })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor retrieved successfully',
    type: VendorApplicationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
  })
  async getVendorById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Vendors> {
    this.logger.debug(`Fetching vendor by ID: ${id}`);
    return await this.vendorService.getApplicationByUserId(id);
  }

  @Post(':id/suspend')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({
    summary: 'Suspend vendor account (Admin only)',
    description: 'Suspend an approved vendor account',
  })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor suspended successfully',
    type: VendorApplicationResponseDto,
  })
  @UseGuards(AdminGuard)
  async suspendVendor(
    @Param('id', ParseUUIDPipe) vendorId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Vendors> {
    this.logger.warn(
      `Admin ${req.user.id} suspended vendor ${vendorId}`,
      VendorsController.name,
    );
    return await this.vendorService.suspendVendor(vendorId);
  }

  @Post(':id/reactivate')
  @ApiOperation({
    summary: 'Reactivate suspended vendor (Admin only)',
    description: 'Reactivate a suspended vendor account',
  })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor reactivated successfully',
    type: VendorApplicationResponseDto,
  })
  @UseGuards(AdminGuard)
  async reactivateVendor(
    @Param('id') vendorId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Vendors> {
    this.logger.warn(
      `Admin ${req.user.id} reactivated vendor ${vendorId}`,
      VendorsController.name,
    );
    return await this.vendorService.reactivateVendor(vendorId);
  }
}
