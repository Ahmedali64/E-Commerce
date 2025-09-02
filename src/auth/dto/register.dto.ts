import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  Length,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsStrongPassword } from '../../common/decorators/is-strong-password.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterUserDTO {
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

  // function IsPhoneNumber(
  //   region: string | null,
  //   validationOptions?: ValidationOptions,
  // ): PropertyDecorator;
  @IsOptional()
  @IsPhoneNumber('EG', {
    message: 'Please provide a valid phone number',
  })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be customer, vendor, or admin' })
  role?: UserRole = UserRole.CUSTOMER;
}
