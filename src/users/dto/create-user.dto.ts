import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  Length,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsStrongPassword } from '../../common/decorators/is-strong-password.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { UpdateDateColumn } from 'typeorm/browser';

export class CreateUserDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : '',
  )
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  firstName: string;

  @IsString()
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  lastName: string;

  @IsOptional()
  @IsPhoneNumber('EG', {
    message: 'Please provide a valid phone number',
  })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be customer, vendor, or admin' })
  role?: UserRole = UserRole.CUSTOMER;

  @IsBoolean()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
