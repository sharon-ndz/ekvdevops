import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { requestLogger } from './middlewares/logger/request-logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as process from 'node:process';
import { config } from 'dotenv';
import { setupSwagger } from './core/helpers/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import logger from './core/logger';
config();

function normalizeOrigins() {
  const envs = process.env.ORIGINS?.split(',') ?? [];
  if (envs.length === 1) {
    return envs[0];
  }
  return envs;
}

async function bootstrap() {
  //^ create app and enable cors
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: normalizeOrigins(),
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 200,
    },
    logger: new Logger(),
  });

  //^ enable app to use validation pip
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  // use helmet for security
  app.use(
    helmet({
      contentSecurityPolicy: false, // disable content security policy
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // increase the request size limit
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(requestLogger({ log: logger.log }));
  // Set swagger for documentation
  setupSwagger(app);

  await app
    .listen(process.env.PORT ?? 3000)
    .then(async () => console.log(`main server listening on ${await app.getUrl()}\n`));
}
bootstrap().then((r) => r);
