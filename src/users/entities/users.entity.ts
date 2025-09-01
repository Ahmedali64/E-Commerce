import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  //u do not have to make an index here cause unique itself is an index
  @Column({ type: 'varchar', length: 225, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;
}
