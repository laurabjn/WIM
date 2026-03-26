import { PasswordResetTokenRepository } from 'src/domain/auth/repositories/password-reset-token-repository';
import { RequestPasswordResetUseCase } from 'src/application/auth/use-cases/request-password-reset.usecase';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenRepository: jest.Mocked<PasswordResetTokenRepository>;
  let emailSender: jest.Mocked<EmailSenderPort>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updatePasswordHash: jest.fn(),
      updateIdentityStatus: jest.fn(),
    };

    tokenRepository = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    emailSender = {
      send: jest.fn(),
    } as any;

    useCase = new RequestPasswordResetUseCase(
      userRepository,
      tokenRepository,
      3600,
      emailSender,
      'https://localhost:3001',
    );
  });

  it('should return a reset token when user exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hash',
      firstName: 'Laura',
      lastName: 'Bojon',
      isAdmin: false,
      avatarUrl: null,
      bio: null,
      country: null,
      nationality: null,
      phone: null,
      birthDate: null,
      identityStatus: IdentityStatus.NOT_VERIFIED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    tokenRepository.sign.mockResolvedValue('jwt-reset-token');

    await useCase.execute('test@example.com', 'fr');

    expect(tokenRepository.sign).toHaveBeenCalledWith(
      { userId: 'user-1' },
      3600,
    );
    expect(emailSender.send).toHaveBeenCalledTimes(1);

    const callArgs = emailSender.send.mock.calls[0][0];
    expect(callArgs.to).toBe('test@example.com');
    expect(callArgs.subject).toBeDefined();
    expect(callArgs.html).toContain('reset-password');
  });

  it('should not reveal if user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await useCase.execute('unknown@example.com', 'fr');

    expect(tokenRepository.sign).not.toHaveBeenCalled();
    expect(emailSender.send).not.toHaveBeenCalled();
  });
});
