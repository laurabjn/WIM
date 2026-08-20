import { PasswordHasher } from 'src/shared/utils/password-hasher';
import { RegisterUserUseCase } from 'src/application/auth/use-cases/register-user.usecase';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';
import { UserAlreadyExistsError } from 'src/domain/auth/errors/user-already-exist.error';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updatePasswordHash: jest.fn(),
      updateIdentityStatus: jest.fn(),
      touchLastSeen: jest.fn(),
      findLastSeen: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  it('should create a new user when email is not taken', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');

    userRepository.create.mockResolvedValue({
      id: 'uuid-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Hello, I am John!',
      country: 'USA',
      nationality: 'American',
      phone: '+1234567890',
      birthDate: '1990-01-01',
      identityStatus: IdentityStatus.NOT_VERIFIED,
      createdAt: new Date(),
      updatedAt: new Date(),
      suspendedAt: null,
    });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'secret123',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Hello, I am John!',
      country: 'USA',
      nationality: 'American',
      phone: '+1234567890',
      birthDate: '1990-01-01',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(passwordHasher.hash).toHaveBeenCalledWith('secret123');
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Hello, I am John!',
      country: 'USA',
      nationality: 'American',
      phone: '+1234567890',
      birthDate: '1990-01-01',
    });

    expect(result).toMatchObject({
      id: 'uuid-1',
      email: 'test@example.com',
    });
  });

  it('should throw if email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'existing-id',
      email: 'test@example.com',
      passwordHash: 'xxx',
      firstName: 'Existing',
      lastName: 'User',
      isAdmin: false,
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Hello, I am Existing!',
      country: 'USA',
      nationality: 'American',
      phone: '+1234567890',
      birthDate: '1990-01-01',
      identityStatus: IdentityStatus.NOT_VERIFIED,
      createdAt: new Date(),
      updatedAt: new Date(),
      suspendedAt: null,
    });

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'secret123',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        bio: 'Hello, I am John!',
        country: 'USA',
        nationality: 'American',
        phone: '+1234567890',
        birthDate: '1990-01-01',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);

    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
