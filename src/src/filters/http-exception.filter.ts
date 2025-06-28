import { Catch, ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { ErrorData } from '../core/interfaces/all.dto';
import logger from '../core/logger';

export const getErrorDetails = (exception: any): any => {
  if (exception.response instanceof ErrorData || exception.message instanceof ErrorData) {
    return (exception.response as ErrorData).details || (exception.message as ErrorData).details;
  }
  if (Array.isArray(exception?.response?.message)) {
    return exception.response.message;
  }
};

export const getErrorMessage = (exception: any): string => {
  if (!exception || !exception.message) {
    return 'Internal server error';
  }
  if (typeof exception.message === 'string') {
    return exception.message;
  }
  // nestjs error with our payload error object
  if (exception.message instanceof ErrorData) {
    return (exception.message as ErrorData).message;
  }
  // nestjs error
  return exception.message.message;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const error = this.getErrorType(exception);
    const details = getErrorDetails(exception);
    const message = details || getErrorMessage(exception);

    logger.error(message, exception, details);

    const statusCode = this.getStatus(exception);
    response.status(statusCode).json({
      statusCode,
      error,
      message,
    });
  }

  private getStatus(exception: any): string {
    // nestjs exceptions
    if (typeof exception.getStatus === 'function') {
      return exception.getStatus();
    }
    // BaseError interface's property
    return exception.statusCode || exception.status || 500;
  }

  private getErrorType(exception: any): string {
    return (exception && exception.constructor.name) || 'Error';
  }
}
