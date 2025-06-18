import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MESSAGES } from '../constants/messages';
import { appConstants } from '../constants/constants';
import { config } from 'dotenv';
config();

export function setupSwagger(app: INestApplication) {
  const swaggerOptions = new DocumentBuilder()
    .setTitle(MESSAGES.docTitle)
    .setDescription(MESSAGES.docDescription)
    .addServer(`${process.env.LOCAL_URL}`, 'Local environment')
    .addServer(`${process.env.STAGING_URL}`, 'Staging')
    .addBearerAuth({ scheme: 'Bearer', type: 'http' })
    .setVersion('1.0.0')
    .addTag(appConstants.appName)
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions, {});
  SwaggerModule.setup('api-docs', app, document);
}
