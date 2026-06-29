import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorResponseBody = {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  method: string;
  correlationId?: string;
  timestamp: string;
};

type HttpExceptionResponse = {
  statusCode?: number;
  error?: string;
  message?: string | string[];
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request & { correlationId?: string }>();
    const response = context.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const normalizedExceptionResponse =
      this.normalizeExceptionResponse(exceptionResponse);

    const errorResponse: ErrorResponseBody = {
      statusCode,
      error:
        normalizedExceptionResponse.error ??
        this.getDefaultErrorName(statusCode),
      message:
        normalizedExceptionResponse.message ??
        this.getDefaultErrorMessage(statusCode),
      path: request.originalUrl ?? request.url,
      method: request.method,
      correlationId: this.getCorrelationId(request),
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      JSON.stringify({
        event: 'http_exception',
        statusCode: errorResponse.statusCode,
        error: errorResponse.error,
        message: errorResponse.message,
        method: errorResponse.method,
        path: errorResponse.path,
        correlationId: errorResponse.correlationId,
      }),
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(statusCode).json(errorResponse);
  }

  private normalizeExceptionResponse(
    exceptionResponse: string | object | null,
  ): Partial<HttpExceptionResponse> {
    if (!exceptionResponse) {
      return {};
    }

    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return exceptionResponse as Partial<HttpExceptionResponse>;
  }

  private getCorrelationId(
    request: Request & { correlationId?: string },
  ): string | undefined {
    const headerCorrelationId = request.headers['x-correlation-id'];

    if (typeof headerCorrelationId === 'string') {
      return headerCorrelationId;
    }

    if (Array.isArray(headerCorrelationId)) {
      return headerCorrelationId[0];
    }

    return request.correlationId;
  }

  private getDefaultErrorName(statusCode: number): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Internal Server Error';
    }

    return 'Error';
  }

  private getDefaultErrorMessage(statusCode: number): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Unexpected internal server error.';
    }

    return 'Request failed.';
  }
}
