import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // nginx arkasındayız: gerçek istemci IP'si X-Forwarded-For'dan gelir
  // (throttler'ın herkesi tek IP saymaması için şart).
  app.set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prisma hatalarını 409/404/400'e eşle (500 sızdırma).
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Let Nest tear down Prisma cleanly on SIGTERM/SIGINT.
  app.enableShutdownHooks();

  // Swagger: SWAGGER_ENABLED=0 ile kapatılabilir (lansmanda önerilir).
  if (process.env.SWAGGER_ENABLED !== '0') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Celine Gelinlik API')
      .setDescription('Public showcase reads + appointment intake')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port} — docs at /docs`);
}

void bootstrap();
