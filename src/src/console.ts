import { NestFactory } from '@nestjs/core';
import { ServicesModule } from './services/services.module';
import { NotificationService } from './services/notification-service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ServicesModule);

  const notificationService = app.get(NotificationService);

  const command = process.argv[2];

  if (command) {
    const id = Number(command);
    await notificationService.main(id);
  }

  await app.close();
  process.exit(0);
}

bootstrap();
