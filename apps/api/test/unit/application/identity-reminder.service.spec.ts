import { IdentityReminderService } from 'src/application/auth/services/identity-reminder.service';
import { buildIdentityReminderEmail } from 'src/shared/utils/identity-reminder.template';

function creer(comptes: unknown[]) {
  const prisma = {
    user: {
      findMany: jest.fn().mockResolvedValue(comptes),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  const pushSender = { sendToUser: jest.fn().mockResolvedValue(undefined) };
  const emailSender = { send: jest.fn().mockResolvedValue(undefined) };

  return {
    prisma,
    pushSender,
    emailSender,
    service: new IdentityReminderService(
      prisma as never,
      pushSender as never,
      emailSender as never,
    ),
  };
}

describe('IdentityReminderService', () => {
  const lea = {
    id: 'user-1',
    email: 'lea@exemple.fr',
    firstName: 'Léa',
    preferredLocale: 'fr',
  };

  it('ne relance que les comptes sans logement, une seule fois', async () => {
    const { prisma, service } = creer([]);

    await service.appliquer();

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isAdmin: false,
          identityReminderSentAt: null,
          homes: { none: {} },
        }),
      }),
    );
  });

  it('ecrit dans la langue du compte et marque le rappel envoye', async () => {
    const { prisma, emailSender, pushSender, service } = creer([
      lea,
      { ...lea, id: 'user-2', email: 'tom@example.com', firstName: 'Tom', preferredLocale: 'en' },
    ]);

    await expect(service.appliquer()).resolves.toBe(2);

    expect(emailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'lea@exemple.fr',
        subject: 'Votre logement attend ses premiers voyageurs',
      }),
    );
    expect(emailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'tom@example.com',
        subject: 'Your home is waiting for its first guests',
      }),
    );
    expect(pushSender.sendToUser).toHaveBeenCalledTimes(2);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' } }),
    );
  });

  it('ne marque pas envoye un rappel que le courriel a refuse', async () => {
    const { prisma, emailSender, service } = creer([lea]);

    emailSender.send.mockRejectedValue(new Error('SMTP injoignable'));

    await expect(service.appliquer()).resolves.toBe(0);

    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe('buildIdentityReminderEmail', () => {
  it('glisse le prenom quand il existe', () => {
    expect(buildIdentityReminderEmail('fr', 'Léa').text).toContain('Bonjour Léa,');
  });

  it('salue sans prenom quand il manque', () => {
    expect(buildIdentityReminderEmail('en', null).text).toContain('Hello,');
    expect(buildIdentityReminderEmail('en', null).text).not.toContain('{{');
  });
});
