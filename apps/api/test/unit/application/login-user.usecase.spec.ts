import { LoginUserUseCase } from 'src/application/auth/use-cases/login-user.usecase';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';
import { InvalidCredentialsError } from 'src/domain/auth/errors/invalid-credentiels.errors';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { PasswordHasher } from 'src/shared/utils/password-hasher';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updatePasswordHash: jest.fn(),
      updateIdentityStatus: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    useCase = new LoginUserUseCase(userRepository, passwordHasher);
  });

  it('should return user when email and password are correct', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'uuid-1',
      email: 'test@example.com',
      passwordHash: 'hashed',
      firstName: 'Laura',
      lastName: 'Bojon',
      isAdmin: false,
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Hello, I am Laura!',
      country: 'USA',
      nationality: 'American',
      phone: '+1234567890',
      birthDate: '1990-01-01',
      identityStatus: IdentityStatus.NOT_VERIFIED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    passwordHasher.compare.mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'secret123',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(passwordHasher.compare).toHaveBeenCalledWith('secret123', 'hashed');

    expect(result).toMatchObject({
      id: 'uuid-1',
      email: 'test@example.com',
    });
  });

  it('should throw if user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'missing@example.com',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should throw if password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'uuid-1',
      email: 'test@example.com',
      passwordHash: 'hashed',
      firstName: 'Laura',
      lastName: 'Bojon',
      isAdmin: false,
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Hello, I am Laura!',
      country: 'USA',
      nationality: 'American',
      phone: '+1234567890',
      birthDate: '1990-01-01',
      identityStatus: IdentityStatus.NOT_VERIFIED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'wrong',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
