import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendors, VendorStatus } from './entities/vendors.entity';
import { Repository } from 'typeorm';
import { CreateVendorApplicationDto } from './dto/create-vendor-application.dto';
import { UpdateVendorApplicationDto } from './dto/update-vendor.dto';
import { ApproveVendorDto } from './dto/admin-approval.dto';
import { RejectVendorDto } from './dto/admin-rejection.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendors)
    private readonly vendorsRepo: Repository<Vendors>,
  ) {}

  // 1- We will work on vendors application workflow
  async submitApplication(
    userId: string,
    createVendorDto: CreateVendorApplicationDto,
  ): Promise<Vendors> {
    const existingVendor = await this.vendorsRepo.findOne({
      where: { userId },
    });

    if (existingVendor) {
      throw new ConflictException('User already has a vendor account');
    }

    const vendor = this.vendorsRepo.create({
      userId,
      ...createVendorDto,
      status: VendorStatus.PENDING,
      isActive: false, // Not active until approved
    });
    //I will not do these features rn i will just stick with this for now and after i make my final working depolyed version i will add these in version 2
    // TODO: Send notification to admin about new application
    // TODO: Send confirmation email to vendor

    const savedVendor = await this.vendorsRepo.save(vendor);
    return savedVendor;
  }

  async getApplicationByUserId(userId: string): Promise<Vendors> {
    const vendor = await this.vendorsRepo.findOne({
      where: { userId },
      relations: ['products'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor application not found');
    }

    return vendor;
  }
  async updateApplication(
    userId: string,
    updateVendorDto: UpdateVendorApplicationDto,
  ): Promise<Vendors> {
    const vendor = await this.getApplicationByUserId(userId);

    // Only allow updates if application is still pending
    if (vendor.status !== VendorStatus.PENDING) {
      throw new BadRequestException('Cannot update application after review');
    }

    Object.assign(vendor, updateVendorDto);
    return await this.vendorsRepo.save(vendor);
  }
  // This is for admins only
  async getPendingApplications(): Promise<Vendors[]> {
    return await this.vendorsRepo.find({
      where: { status: VendorStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async approveApplication(
    vendorId: string,
    approveDto: ApproveVendorDto,
  ): Promise<Vendors> {
    const vendor = await this.vendorsRepo.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.status !== VendorStatus.PENDING) {
      throw new BadRequestException('Can only approve pending applications');
    }

    vendor.status = VendorStatus.APPROVED;
    vendor.isActive = true;
    vendor.approvedAt = new Date();

    if (approveDto.commissionRate) {
      vendor.commissionRate = approveDto.commissionRate;
    }
    const approvedVendor = await this.vendorsRepo.save(vendor);
    // Version 2
    // TODO: Send approval email to vendor
    // TODO: Create vendor dashboard access
    // TODO: Log admin action
    return approvedVendor;
  }

  async rejectApplication(
    vendorId: string,
    rejectDto: RejectVendorDto,
  ): Promise<{ message: string }> {
    const vendor = await this.vendorsRepo.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.status !== VendorStatus.PENDING) {
      throw new BadRequestException('Can only reject pending applications');
    }

    await this.vendorsRepo.remove(vendor);

    // Version 2
    // TODO: Send rejection email with reason to applicant
    // TODO: Log admin action

    return {
      message: `Vendor application rejected. Reason: ${rejectDto.reason}`,
    };
  }

  async suspendVendor(vendorId: string): Promise<Vendors> {
    const vendor = await this.vendorsRepo.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.status !== VendorStatus.APPROVED) {
      throw new BadRequestException('Can only suspend approved vendors');
    }

    vendor.status = VendorStatus.SUSPENDED;
    vendor.isActive = false;

    const suspendedVendor = await this.vendorsRepo.save(vendor);

    // Version 2
    // TODO: Send suspension notification to vendor
    // TODO: Deactivate all vendor products
    // TODO: Log admin action

    return suspendedVendor;
  }

  async reactivateVendor(vendorId: string): Promise<Vendors> {
    const vendor = await this.vendorsRepo.findOne({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.status !== VendorStatus.SUSPENDED) {
      throw new BadRequestException('Can only reactivate suspended vendors');
    }

    vendor.status = VendorStatus.APPROVED;
    vendor.isActive = true;

    const reactivatedVendor = await this.vendorsRepo.save(vendor);

    // TODO: Send reactivation notification to vendor
    // TODO: Reactivate vendor products (optional)
    // TODO: Log admin action

    return reactivatedVendor;
  }

  async getAllVendors(status?: VendorStatus): Promise<Vendors[]> {
    // Here we are getting vendors and there products that is why we are left joining it with products
    const query = this.vendorsRepo
      .createQueryBuilder('vendor')
      .leftJoinAndSelect('vendor.products', 'products');

    if (status) {
      query.where('vendor.status = :status', { status });
    }

    return await query.orderBy('vendor.createdAt', 'DESC').getMany();
  }

  async getVendorStats() {
    const [total, pending, approved, suspended] = await Promise.all([
      this.vendorsRepo.count(),
      this.vendorsRepo.count({ where: { status: VendorStatus.PENDING } }),
      this.vendorsRepo.count({ where: { status: VendorStatus.APPROVED } }),
      this.vendorsRepo.count({ where: { status: VendorStatus.SUSPENDED } }),
    ]);

    return {
      total,
      pending,
      approved,
      suspended,
      activePercentage: total > 0 ? ((approved / total) * 100).toFixed(2) : 0,
    };
  }
}
