import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDTO } from './dto/register.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import type { Request, Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/err-response.dto';
import { LoginSuccessDto } from 'src/common/dto/login-success.dto';
import { LogoutSuccessDto } from 'src/common/dto/logout-success.dto';
import { LogoutErrorDto } from 'src/common/dto/logout-err.dto';
import { CsrfTokenDto } from 'src/common/dto/csrf-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  //Register
  @Post('register')
  @ApiOperation({ summary: 'Register new user.' })
  @ApiResponse({
    status: 200,
    description: 'Return full user.data',
    type: RegisterUserDTO,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  register(@Body() userData: RegisterUserDTO): Promise<UserResponseDto> {
    return this.usersService.registerUser(userData);
  }

  //Login
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Login user.' })
  @ApiResponse({
    status: 200,
    description: 'Return full user data and csrf token',
    type: LoginSuccessDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found for login',
    type: ErrorResponseDto,
  })
  login(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      return res.status(400).json({ message: 'User not found for login' });
    }
    req.logIn(req.user, (err) => {
      if (err) {
        throw err;
      }
      res.json({
        message: 'Logged in successfully',
        user: req.user,
        csrfToken: req.csrfToken(),
      });
    });
  }

  //Logout
  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout user.' })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
    type: LogoutSuccessDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Logout or session cleanup failed',
    type: LogoutErrorDto,
  })
  logout(@Req() req: Request, @Res() res: Response) {
    //Remobe req.user from Request
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      //Remove sesssion data from redis and client browser
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return res.status(500).json({ message: 'Session cleanup failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  }

  //Getting CSRF Token
  @Get('csrf-token')
  @ApiOperation({ summary: 'Get CSRF token.' })
  @ApiResponse({
    status: 200,
    description: 'Return CSRF token for the session.',
    type: CsrfTokenDto,
  })
  getCsrfToken(@Req() req: Request) {
    return { csrfToken: req.csrfToken() };
  }
}
