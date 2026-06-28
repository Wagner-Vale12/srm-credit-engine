import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { RequestWithCorrelationId } from './correlation-id.middleware';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithCorrelationId>();
    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;

        this.logger.log(
          JSON.stringify({
            event: 'http_request_completed',
            correlationId: request.correlationId,
            method: request.method,
            path: request.originalUrl ?? request.url,
            statusCode: response.statusCode,
            durationMs,
          }),
        );
      }),
      catchError((error: unknown) => {
        const durationMs = Date.now() - startedAt;
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;

        this.logger.error(
          JSON.stringify({
            event: 'http_request_failed',
            correlationId: request.correlationId,
            method: request.method,
            path: request.originalUrl ?? request.url,
            statusCode,
            durationMs,
            error:
              error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                  }
                : {
                    message: 'Unknown error',
                  },
          }),
          error instanceof Error ? error.stack : undefined,
        );

        return throwError(() => error);
      }),
    );
  }
}
