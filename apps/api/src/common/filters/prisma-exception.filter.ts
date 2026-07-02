import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/**
 * Prisma hatalarını anlamlı HTTP durumlarına eşler; public uçlarda 500
 * sızdırmayız. P2002 → 409, P2025 → 404, P2003 → 400, validation → 400.
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientValidationError) {
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Geçersiz istek gövdesi.',
        error: 'Bad Request',
      });
      return;
    }

    switch (exception.code) {
      case 'P2002':
        res.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Bu değer zaten kullanımda (benzersiz alan çakışması).',
          error: 'Conflict',
        });
        return;
      case 'P2025':
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Kayıt bulunamadı.',
          error: 'Not Found',
        });
        return;
      case 'P2003':
        res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'İlişkili kayıt bulunamadı.',
          error: 'Bad Request',
        });
        return;
      default:
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Beklenmeyen bir hata oluştu.',
          error: 'Internal Server Error',
        });
    }
  }
}
