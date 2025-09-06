import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;

    const handler = context.getHandler().name; // controller method name
    const controller = context.getClass().name; // controller class name

    this.logger.log(`[${controller}.${handler}] ${method} ${url} - Incoming`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(
          `[${controller}.${handler}] ${method} ${url} - Completed in ${duration}ms`,
        );
      }),
    );
  }
}
