import { Catch, NotFoundException } from '@nestjs/common';
import { ExceptionFilter } from '@nestjs/common';

@Catch(NotFoundException)
export class FileNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: import('@nestjs/common').ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.status(404).json({
      statusCode: 404,
      message: 'The requested url could not be found',
      error: 'Not Found',
    });
  }
}
