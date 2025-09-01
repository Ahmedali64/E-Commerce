import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    return Promise.resolve(req.isAuthenticated()); // Returns true if user is in session
  }
}

// This is what Passport does internally (simplified)
// req.isAuthenticated = function() {
//   return !!(this.user); // Returns true if req.user exists, false otherwise
// }
