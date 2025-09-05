import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class UserResponseDto {
  @Expose()
  @ApiProperty({ example: 'uuid-string', description: 'User ID' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'example@email.com', description: 'User email' })
  email: string;

  @Exclude()
  password: string;

  @Expose()
  @ApiProperty({ example: 'Ahmed', description: 'First name' })
  firstName: string;

  @Expose()
  @ApiProperty({ example: 'Ali', description: 'Last name' })
  lastName: string;

  @Expose()
  @ApiProperty({
    example: '01012345678',
    description: 'User phone number',
    required: false,
  })
  phone?: string;

  @Expose()
  @ApiProperty({ example: 'customer', description: 'User role' })
  role: UserRole;

  @Expose()
  @ApiProperty({ example: true, description: 'Is the user active?' })
  isActive: boolean;

  @Expose()
  @ApiProperty({
    example: '2025-09-05T12:00:00.000Z',
    description: 'Created at date',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2025-09-05T12:00:00.000Z',
    description: 'Updated at date',
  })
  updatedAt: Date;
}
