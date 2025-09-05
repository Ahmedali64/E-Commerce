import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SessionSerializer } from './session/session.serializer';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Module({
  imports: [
    UsersModule,
    //NestJS internally calls when u do this line:
    //passport.initialize()
    //passport.session()
    PassportModule.register({ session: true }), // This is crucial!
  ],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer,
    AuthenticatedGuard,
    LocalAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, LocalAuthGuard, AuthenticatedGuard],
})
export class AuthModule {}
