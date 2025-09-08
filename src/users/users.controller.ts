import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { UserResponseDto } from './dto/user-response.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/req-user.interface';
import { UpdateUserDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { plainToClass } from 'class-transformer';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/err-response.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@ApiTags('Users')
@UseGuards(AuthenticatedGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return user profile.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  getProfile(@Req() req: AuthenticatedRequest): UserResponseDto {
    this.logger.log(`Fetching profile for userId=${req.user.id}`);
    return plainToClass(UserResponseDto, req.user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return updated user.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async updateProfile(
    @Body() userProfileData: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.warn(`User ${req.user.id} is updating profile`);
    return await this.usersService.updateUserProfile(
      userProfileData,
      req.user.id,
    );
  }
}
