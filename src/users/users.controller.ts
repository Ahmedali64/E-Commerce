import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { UserResponseDto } from './dto/user-response.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/req-user.interface';
import { UpdateUserDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { plainToClass } from 'class-transformer';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/err-response.dto';

@ApiTags('Users')
@UseGuards(AuthenticatedGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile.' })
  @ApiResponse({
    status: 200,
    description: 'Return user profile.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  getProfile(@Req() req: AuthenticatedRequest): UserResponseDto {
    return plainToClass(UserResponseDto, req.user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile.' })
  @ApiResponse({
    status: 200,
    description: 'Return updated user.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
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
