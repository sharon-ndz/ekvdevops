import { INestApplicationContext } from '@nestjs/common';
import { ContextIdFactory, NestFactory } from '@nestjs/core';
import { ServicesModule } from '../services.module';
import { Context } from 'aws-lambda';
import { NotificationService } from '.';

let app: INestApplicationContext;

const bootstrap = async () => {
  if (!app) {
    app = await NestFactory.createApplicationContext(ServicesModule, { logger: false });
  }
  return app;
};

export const handler = async (event: any, context: Context) => {
  const instance = await bootstrap();

  const contextId = ContextIdFactory.create();
  instance.registerRequestByContextId({ event, context }, contextId);
  const service = await instance.resolve<NotificationService>(NotificationService, contextId);
  for (const record of event.Records) {
    const { emailId } = JSON.parse(record.body);
    console.log(`ID from queue ${emailId}`);
    await service.main(emailId);
  }
  return;
};
