import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { plainToClass } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthenticatedRequest } from 'src/common/interfaces/req-user.interface';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: { updateUserProfile: jest.Mock };

  beforeEach(async () => {
    mockUsersService = {
      updateUserProfile: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('UserController - getProfile', () => {
    it('should return the logged-in user as UserResponseDto', () => {
      const fakeUser = {
        id: '1',
        email: 'test@example.com',
        password: 'secret',
      };

      // create a fake request object
      const req = { user: fakeUser } as AuthenticatedRequest;

      // act
      const result = controller.getProfile(req);

      // assert
      const expected = plainToClass(UserResponseDto, fakeUser, {
        excludeExtraneousValues: true,
      });
      expect(result).toEqual(expected);
      expect(result).toHaveProperty('password', undefined);
    });
  });

  describe('UserController - updateProfile', () => {
    it('should return updated user when u update anyfield', async () => {
      //i should send req m Body
      const fakeDto = { email: 'new@example.com' };
      const fakeReq = { user: { id: '123' } } as AuthenticatedRequest;
      const fakeResponse = { id: '123', email: 'new@example.com' };
      mockUsersService.updateUserProfile.mockResolvedValue(fakeResponse);

      const result = await controller.updateProfile(fakeDto, fakeReq);

      expect(mockUsersService.updateUserProfile).toHaveBeenCalledWith(
        fakeDto,
        '123',
      );
      expect(result).toEqual(fakeResponse);
    });
  });
});
