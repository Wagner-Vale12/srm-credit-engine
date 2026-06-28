import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export type RequestWithCorrelationId = Request & {
  correlationId?: string;
};

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(
    request: RequestWithCorrelationId,
    response: Response,
    next: NextFunction,
  ) {
    const incomingCorrelationId = request.headers['x-correlation-id'];

    const correlationId = Array.isArray(incomingCorrelationId)
      ? incomingCorrelationId[0]
      : incomingCorrelationId || randomUUID();

    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    next();
  }
}
