import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  Length,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../common/decorators/is-strong-password.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterUserDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : '',
  )
  @ApiProperty({
    example: 'john.doe@email.com',
    description: 'Unique email address of the user',
  })
  email: string;

  @IsString()
  @IsStrongPassword()
  @ApiProperty({
    example: 'StrongPass123!',
    description:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsString()
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  firstName: string;

  @IsString()
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  lastName: string;

  @IsOptional()
  @IsPhoneNumber('EG', {
    message: 'Please provide a valid phone number',
  })
  @ApiProperty({
    example: '01012345678',
    description: 'Egyptian phone number (optional)',
    required: false,
  })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be customer, vendor, or admin' })
  @ApiProperty({
    example: UserRole.CUSTOMER,
    enum: UserRole,
    description: 'Role of the user',
    required: false,
  })
  role?: UserRole = UserRole.CUSTOMER;
}
