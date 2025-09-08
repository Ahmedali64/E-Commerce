import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';
import { AuthenticatedRequest } from '../interfaces/req-user.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // request.user comes from deserializeUser - always fresh!
    return request.user && request.user.role === UserRole.ADMIN;
  }
}
