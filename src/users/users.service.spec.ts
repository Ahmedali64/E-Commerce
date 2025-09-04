import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/users.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

//mock bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  // we used findOne, create, save, update, bcrypt
  let mockUserRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  //fake user
  const now = new Date();
  const user: CreateUserDto = {
    id: 'RandomUUID',
    email: 'example@email.com',
    password: 'secret',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: '01021354656',
    role: UserRole.CUSTOMER,
    isActive: true,
    createdAt: now,
  };
  beforeEach(async () => {
    //creat our mocked funcs
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    // create test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('UsersService - findByEmail', () => {
    it('should return a user', async () => {
      //prepare return values
      mockUserRepository.findOne.mockResolvedValue(user);

      //Act
      const result = await service.findByEmail(user.email);

      //Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: user.email, isActive: true },
      });
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      //prepare return values
      mockUserRepository.findOne.mockResolvedValue(null);

      //Act
      const result = await service.findByEmail('email');

      //Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'email', isActive: true },
      });
      expect(result).toBeNull();
    });
  });

  describe('UsersService - findUserById', () => {
    it('should return a user', async () => {
      //fake user
      const user = {
        id: 'RandomId',
        email: 'example@email.com',
        password: 'secret',
        firstName: 'firstName',
        lastName: 'lastName',
        phone: '01021354656',
        role: 'role',
        isActive: true,
      };

      //prepare return values
      mockUserRepository.findOne.mockResolvedValue(user);

      //Act
      const result = await service.findUserById(user.id);

      //Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id, isActive: true },
      });
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      //prepare return values
      mockUserRepository.findOne.mockResolvedValue(null);

      //Act
      const result = await service.findUserById('RandomId');

      //Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'RandomId', isActive: true },
      });
      expect(result).toBeNull();
    });
  });

  describe('UsersService - validatePassword', () => {
    it('should return true if password matches hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(
        'plainPassword',
        'hashedPassword',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plainPassword',
        'hashedPassword',
      );
      expect(result).toBe(true);
    });

    it('should return false if password does not match hash', async () => {
      // Arrange
      // jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validatePassword(
        'wrongPassword',
        'hashedPassword',
      );

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword',
      );
      expect(result).toBe(false);
    });
  });

  describe('UsersService - registerUser', () => {
    it('should create a new user when email is not taken', async () => {
      //prepare return values
      // const findByEmailSpy = (
      //   service.findByEmail as jest.Mock
      // ).mockResolvedValue(null);

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const hasedPasswordUser = { ...user, password: 'hashedPassword' };

      mockUserRepository.create.mockResolvedValue(hasedPasswordUser);

      mockUserRepository.save.mockResolvedValue(hasedPasswordUser);

      //Act
      const result = await service.registerUser(user);

      //Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findByEmail).toHaveBeenCalledWith(user.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(hasedPasswordUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('password', undefined);
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser: User = {
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: UserRole.CUSTOMER,
        isActive: true,
        createdAt: user.createdAt,
      };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.registerUser(existingUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('UsersService - updateUserProfile', () => {
    it('should throw NotFoundException if no user is affected', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.updateUserProfile(
          {
            firstName: user.firstName,
          },
          user.id,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, {
        firstName: user.firstName,
      });
    });

    it('should update user and return UserResponseDto', async () => {
      const updatedUser = {
        ...user,
        firstName: 'updatedFirstName',
      };
      const existingUser: User = {
        id: updatedUser.id,
        email: updatedUser.email,
        password: updatedUser.password,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        role: UserRole.CUSTOMER,
        isActive: true,
        createdAt: updatedUser.createdAt,
      };

      mockUserRepository.update.mockResolvedValue(updatedUser);

      jest.spyOn(service, 'findUserById').mockResolvedValue(existingUser);

      //Act
      const result = await service.updateUserProfile(
        { firstName: 'updatedFirstName' },
        user.id,
      );

      //Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, {
        firstName: 'updatedFirstName',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findUserById).toHaveBeenCalled();
      expect(result).toHaveProperty('password', undefined);
    });
  });
});
