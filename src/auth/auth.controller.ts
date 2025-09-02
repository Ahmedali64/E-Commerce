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
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { UsersService } from 'src/users/users.service';
import type { Request, Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}
  //Register
  @Post('register')
  register(@Body() userData: RegisterUserDTO): Promise<UserResponseDto> {
    return this.usersService.registerUser(userData);
  }
  //Login
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60 } })
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

  @Get('csrf-token')
  getCsrfToken(@Req() req: Request) {
    return { csrfToken: req.csrfToken() };
  }
}
