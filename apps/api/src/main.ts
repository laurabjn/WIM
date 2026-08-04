import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

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

  app.useStaticAssets(process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Derrière le reverse proxy (Caddy), fait confiance aux en-têtes X-Forwarded-*
  // pour que req.ip et req.protocol reflètent le client réel et non le proxy.
  app.set('trust proxy', 1);

  const port = Number(process.env.PORT) || 3002;
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on port ${port}`);
}
bootstrap();
