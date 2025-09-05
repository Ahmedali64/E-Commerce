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
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : '',
  )
  @ApiProperty({ example: 'example@email.com', description: 'User email' })
  email: string;

  @IsString()
  @IsStrongPassword()
  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password',
    format: 'password',
  })
  password: string;

  @IsString()
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @ApiProperty({ example: 'Ahmed', description: 'User first name' })
  firstName: string;

  @IsString()
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @ApiProperty({ example: 'Ali', description: 'User last name' })
  lastName: string;

  @IsOptional()
  @IsPhoneNumber('EG', { message: 'Please provide a valid phone number' })
  @ApiProperty({
    example: '01012345678',
    description: 'User phone number',
    required: false,
  })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be customer, vendor, or admin' })
  @ApiProperty({
    example: 'customer',
    description: 'User role',
    required: false,
  })
  role?: UserRole = UserRole.CUSTOMER;

  @IsBoolean()
  @ApiProperty({ example: true, description: 'User active status' })
  isActive: boolean;
}
