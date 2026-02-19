import { PasswordHasher } from 'src/shared/utils/password-hasher';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user.usecase';
import { UserAlreadyExistsError } from 'src/domain/errors/user-already-exist.error';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { IdentityStatus } from 'src/domain/entities/user.entity';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
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
      identityStatus: IdentityStatus.NOT_VERIFIED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'secret123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(passwordHasher.hash).toHaveBeenCalledWith('secret123');
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      firstName: 'John',
      lastName: 'Doe',
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
      identityStatus: IdentityStatus.NOT_VERIFIED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'secret123',
        firstName: 'John',
        lastName: 'Doe',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);

    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
