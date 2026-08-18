import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

// Multer n'ouvre pas les dossiers qu'il ne trouve pas : sans eux, tout envoi de
// photo ou de vocal echoue avec une erreur serveur. L'image de production les
// cree, pas un lancement direct.
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

  // Les intercepteurs ecrivent sous le dossier de travail : c'est cette base
  // qu'il faut preparer, meme si la diffusion pointe ailleurs.
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
