import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';
// Define rules with decorators (@Exclude, @Expose) to control serialization (converting
// class instances into JSON objects).
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  phone?: string;

  @Expose()
  role: UserRole;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
