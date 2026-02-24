import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('/auth/register (POST) validation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject weak password', async () => {
    const weakEmail = `test-weak-${Date.now()}@example.com`;
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      email: weakEmail,
      password: 'abc123',
      firstName: 'Test',
      lastName: 'Weak',
      isAdmin: false,
    });

    expect(res.status).toBe(400);
    expect(res.body.message.join(' ')).toMatch(/mot de passe/i);
  });

  it('should accept strong password', async () => {
    const strongEmail = `test-strong-${Date.now()}@example.com`;
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      firstName: 'Laura',
      lastName: 'Smith',
      email: strongEmail,
      password: 'SuperPassword1',
      isAdmin: false,
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
  });
});
