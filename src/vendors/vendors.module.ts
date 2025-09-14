import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendors } from './entities/vendors.entity';

@Module({
  controllers: [VendorsController],
  providers: [VendorsService],
  imports: [TypeOrmModule.forFeature([Vendors])],
})
export class VendorsModule {}
