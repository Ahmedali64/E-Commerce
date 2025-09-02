import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { UserResponseDto } from './dto/user-response.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/req-user.interface';
import { UpdateUserDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { plainToClass } from 'class-transformer';
@UseGuards(AuthenticatedGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  //User get his own profile
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest): UserResponseDto {
    return plainToClass(UserResponseDto, req.user, {
      excludeExtraneousValues: true,
    });
  }
  //Update profil
  @Patch('profile')
  async updateProfile(
    @Body() userProfileData: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.usersService.updateUserProfile(
      userProfileData,
      req.user.id,
    );
  }
}
