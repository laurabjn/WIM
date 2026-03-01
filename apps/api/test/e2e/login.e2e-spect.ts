import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('/auth/login (POST)', () => {
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

  it('should login successfully with correct credentials', async () => {
    const email = `login-success-${Date.now()}@example.com`;
    const password = 'SuperPassword1';

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Laura',
        lastName: 'LoginSuccess',
        email,
        password,
        isAdmin: false,
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.user).toBeDefined();

    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('should return 400 for wrong password', async () => {
    const email = `login-wrong-pass-${Date.now()}@example.com`;
    const password = 'SuperPassword1';

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Laura',
        lastName: 'WrongPass',
        email,
        password,
        isAdmin: false,
      });

    expect(registerRes.status).toBe(201);

    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'WrongPassword123',
    });

    expect(res.status).toBe(400);

    const message = Array.isArray(res.body.message)
      ? res.body.message.join(' ')
      : String(res.body.message ?? '');
    expect(message.toLowerCase()).toMatch(/invalid email or password/i);
  });

  it('should return 400 if email does not exist', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `not-existing-${Date.now()}@example.com`,
        password: 'SomePassword123',
      });

    expect(res.status).toBe(400);
    const message = Array.isArray(res.body.message)
      ? res.body.message.join(' ')
      : String(res.body.message ?? '');
    expect(message.toLowerCase()).toMatch(/invalid email or password/i);
  });

  it('should fail validation if email is invalid', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'not-an-email',
      password: 'SuperPassword1',
    });

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.message)).toBe(true);
    const message = res.body.message.join(' ');
    expect(message.toLowerCase()).toMatch(/email/i);
  });

  it('should fail validation if password is too short', async () => {
    const email = `login-short-pass-${Date.now()}@example.com`;
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'abc',
    });

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.message)).toBe(true);
    const message = res.body.message.join(' ');
    expect(message.toLowerCase()).toMatch(/password/i);
  });
});
