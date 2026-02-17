// test/unit/application/register-user.usecase.spec.ts
import { RegisterUserUseCase } from '../../../src/application/use-cases/register-user.usecase';
import { UserRepository } from '../../../src/domain/repositories/user.repository';

describe('RegisterUserUseCase', () => {
  const makeRepo = (overrides?: Partial<UserRepository>): UserRepository => ({
    existsByEmail: async () => false,
    save: async () => {},
    ...overrides,
  });

  it('should register a user when email is new', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUserUseCase(repo);

    const result = await useCase.execute({ email: 'laura@example.com' });

    expect(result.userId).toBeDefined();
  });

  it('should throw when email already exists', async () => {
    const repo = makeRepo({ existsByEmail: async () => true });
    const useCase = new RegisterUserUseCase(repo);

    await expect(useCase.execute({ email: 'laura@example.com' }))
      .rejects
      .toThrow('Email already used');
  });

  it('should throw when email is invalid', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUserUseCase(repo);

    await expect(useCase.execute({ email: 'not-an-email' }))
      .rejects
      .toThrow('Invalid email');
  });
});
