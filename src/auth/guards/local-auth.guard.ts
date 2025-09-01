import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // This guard uses our Local strategy
  // When applied to a route, it:
  // 1. Extracts email/password from request body
  // 2. Validates credentials using Local strategy
  // 3. Attaches user to request.user if valid
  // 4. Then session part will begin or
  // 4. Throws UnauthorizedException if invalid
}
