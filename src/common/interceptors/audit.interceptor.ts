import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuthenticatedRequest } from '../interfaces/req-user.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, url, body } = request;
    const user = request.user ? request.user.id : 'guest';

    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      tap(() => {
        console.log(
          `[AUDIT] ${timestamp} - User=${user} performed ${method} ${url} with data: ${JSON.stringify(
            body,
          )}`,
        );
      }),
    );
  }
}
