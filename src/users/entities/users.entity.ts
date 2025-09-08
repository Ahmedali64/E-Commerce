import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  //u do not have to make an index here cause unique itself is an index
  @ApiProperty({
    description: 'User email',
    example: 'example@email.com',
    maxLength: 225,
  })
  @Column({
    type: 'varchar',
    length: 225,
    unique: true,
    nullable: false,
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Secret@123',
    minLength: 8,
    writeOnly: true, //just to hide password in the response
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'jhon',
    minLength: 3,
    maxLength: 10,
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'first_name',
  })
  firstName: string;

  @ApiProperty({
    description: 'User Last name',
    example: 'cina',
    minLength: 3,
    maxLength: 10,
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'last_name',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+201012345678',
  })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    unique: true,
  })
  phone?: string | null;

  @ApiProperty({
    description: 'User role ',
    example: UserRole.CUSTOMER,
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Whether the user is active or no',
    example: true,
    default: true,
  })
  @Column({
    default: true,
    name: 'is_active',
  })
  isActive: boolean;
}
