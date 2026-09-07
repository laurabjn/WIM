import { ApplyIdentityVerdictUseCase } from 'src/application/auth/use-cases/apply-identity-verdict.usecase';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';

describe('ApplyIdentityVerdictUseCase', () => {
  function creer(preferredLocale: string, identityStatus = IdentityStatus.IN_PROGRESS) {
    const userRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'lea@exemple.fr',
        identityStatus,
        preferredLocale,
      }),
      updateIdentityStatus: jest.fn().mockResolvedValue(undefined),
    };

    const pushSender = { sendToUser: jest.fn().mockResolvedValue(undefined) };
    const emailSender = { send: jest.fn().mockResolvedValue(undefined) };

    return {
      userRepository,
      pushSender,
      emailSender,
      useCase: new ApplyIdentityVerdictUseCase(
        userRepository as never,
        pushSender as never,
        emailSender as never,
      ),
    };
  }

  it('ecrit en francais a qui a choisi le francais', async () => {
    const { emailSender, pushSender, useCase } = creer('fr');

    await useCase.execute({
      userId: 'user-1',
      status: IdentityStatus.VERIFIED,
    });

    expect(emailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Votre identité est vérifiée' }),
    );

    expect(pushSender.sendToUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ title: 'Identité vérifiée' }),
    );
  });

  it('ecrit en anglais a qui a choisi l anglais', async () => {
    const { emailSender, pushSender, useCase } = creer('en');

    await useCase.execute({
      userId: 'user-1',
      status: IdentityStatus.VERIFIED,
    });

    expect(emailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Your identity is verified' }),
    );

    expect(pushSender.sendToUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ title: 'Identity verified' }),
    );
  });

  it('distingue un echec reessayable d un refus definitif', async () => {
    const reessayable = creer('fr');

    await reessayable.useCase.execute({
      userId: 'user-1',
      status: IdentityStatus.NOT_VERIFIED,
    });

    expect(reessayable.emailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Votre vérification d’identité n’a pas abouti',
      }),
    );

    const definitif = creer('fr');

    await definitif.useCase.execute({
      userId: 'user-1',
      status: IdentityStatus.REFUSED,
    });

    expect(definitif.emailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Votre vérification d’identité a été refusée',
      }),
    );
  });

  it('ne repete pas une annonce deja faite', async () => {
    const { emailSender, pushSender, userRepository, useCase } = creer(
      'fr',
      IdentityStatus.VERIFIED,
    );

    await useCase.execute({
      userId: 'user-1',
      status: IdentityStatus.VERIFIED,
    });

    expect(userRepository.updateIdentityStatus).not.toHaveBeenCalled();
    expect(emailSender.send).not.toHaveBeenCalled();
    expect(pushSender.sendToUser).not.toHaveBeenCalled();
  });

  it('ne laisse pas un courriel en echec faire tomber le webhook', async () => {
    const { emailSender, userRepository, useCase } = creer('fr');
    emailSender.send.mockRejectedValue(new Error('SMTP injoignable'));

    await expect(
      useCase.execute({ userId: 'user-1', status: IdentityStatus.VERIFIED }),
    ).resolves.toBeUndefined();

    expect(userRepository.updateIdentityStatus).toHaveBeenCalled();
  });
});
