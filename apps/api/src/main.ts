import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

const UPLOAD_SUBDIRS = ['avatars', 'homes', 'messages'];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : DEFAULT_CORS_ORIGINS;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  for (const sousDossier of UPLOAD_SUBDIRS) {
    mkdirSync(join(process.cwd(), 'uploads', sousDossier), { recursive: true });
  }

  app.useStaticAssets(process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.set('trust proxy', 1);

  const port = Number(process.env.PORT) || 3002;
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on port ${port}`);
}
bootstrap();
