import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import bcrypt from 'bcrypt';
import { RegisterUserDTO } from 'src/auth/dto/register.dto';
import { plainToClass } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepo.findOne({
      where: { email, isActive: true },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.usersRepo.findOne({
      where: { id, isActive: true },
    });
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async registerUser(userData: RegisterUserDTO): Promise<UserResponseDto> {
    //make sure that email is unique
    const userExists = await this.findByEmail(userData.email);
    if (userExists) {
      throw new ConflictException('Email already exists');
    }
    //user data is fine now we hash password and save his data
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    //create user obj
    const user = this.usersRepo.create({
      ...userData,
      password: hashedPassword,
    });
    //save it
    const savedUser = await this.usersRepo.save(user);
    //This return everything but password
    return plainToClass(UserResponseDto, savedUser, {
      excludeExtraneousValues: true,
    });
  }

  async updateUserProfile(userData: UpdateUserDto, userId: string) {
    const result = await this.usersRepo.update(userId, userData);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = await this.findUserById(userId);
    return plainToClass(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }
}
