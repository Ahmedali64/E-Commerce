import { PartialType, OmitType } from '@nestjs/mapped-types';
import { RegisterUserDTO } from '../../auth/dto/register.dto';

//here we will make all the fields optional but the password and role
export class UpdateUserDto extends PartialType(
  OmitType(RegisterUserDTO, ['password', 'role'] as const),
) {}
