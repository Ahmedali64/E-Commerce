import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './strategies/local.strategy'; // Your existing file
import { LocalAuthGuard } from './guards/local-auth.guard'; // Your existing file
import { SessionSerializer } from './session/session.serializer'; // Your new file
import { AuthenticatedGuard } from './guards/authenticated.guard'; // Need to create this

@Module({
  imports: [
    UsersModule,
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
