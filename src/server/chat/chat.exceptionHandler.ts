import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { ThrottlerException } from '@nestjs/throttler';
import { WsException } from '@nestjs/websockets';

@Catch(HttpException, ThrottlerException, WsException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpException | ThrottlerException | WsException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToWs();
    const client = ctx.getClient();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof ThrottlerException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = 'Rate limit exceeded';
    } else if (exception instanceof WsException) {
      // Handle WebSocket exceptions
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    }

    client.emit('error', {
      status,
      message,
    });
  }
}
