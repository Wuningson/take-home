import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as morgan from 'morgan';

async function bootstrap() {
  dotenv.config({});
  const app = await NestFactory.create(AppModule);
  app.use(morgan('combined'));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('/api/v1/', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
