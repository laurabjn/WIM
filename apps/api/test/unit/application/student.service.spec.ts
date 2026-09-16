import { createHash } from 'node:crypto';

import { StudentService } from 'src/application/subscription/student.service';
import { estUneAdresseDEcole } from 'src/application/subscription/student-domains';

const JOUR_MS = 24 * 60 * 60 * 1000;

function creer(options: {
  compte?: { studentEmail?: string | null; studentVerifiedUntil?: Date | null; preferredLocale?: string };
  enCours?: { email: string; codeHash: string; expiresAt: Date; attempts: number; createdAt: Date } | null;
  externalId?: string | null;
} = {}) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        studentEmail: null,
        studentVerifiedUntil: null,
        preferredLocale: 'fr',
        ...options.compte,
      }),
      update: jest.fn().mockResolvedValue({}),
    },
    studentVerification: {
      findUnique: jest.fn().mockResolvedValue(options.enCours ?? null),
      upsert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    subscription: {
      findUnique: jest.fn().mockResolvedValue(
        options.externalId === undefined ? null : { externalId: options.externalId },
      ),
    },
    $transaction: jest.fn().mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  const emailSender = { send: jest.fn().mockResolvedValue(undefined) };
  const provider = { appliquerUneRemise: jest.fn().mockResolvedValue(true) };

  return {
    prisma,
    emailSender,
    provider,
    service: new StudentService(prisma as never, emailSender as never, provider as never),
  };
}

describe('estUneAdresseDEcole', () => {
  const declare = process.env.STUDENT_EMAIL_DOMAINS;

  afterEach(() => {
    if (declare === undefined) {
      delete process.env.STUDENT_EMAIL_DOMAINS;
    } else {
      process.env.STUDENT_EMAIL_DOMAINS = declare;
    }
  });

  it.each([
    'lea@etu.univ-lyon1.fr',
    'lea@univ-paris8.fr',
    'lea@u-bordeaux.fr',
    'lea@student.42.fr',
    'lea@insa-toulouse.fr',
    'lea@hec.edu',
    'lea@stanford.edu',
    'lea@ox.ac.uk',
    'lea@etudiant.univ-rennes1.fr',
    'lea@epitech.eu',
    'lea@umontreal.ca',
    'lea@epfl.ch',
  ])('reconnait %s', (email) => {
    expect(estUneAdresseDEcole(email)).toBe(true);
  });

  it.each([
    'lea@gmail.com',
    'lea@outlook.fr',
    'lea@education.com',
    'lea@edu-marketing.fr',
    'lea@univ.com',
    'pas-une-adresse',
    'lea@',
  ])('refuse %s', (email) => {
    expect(estUneAdresseDEcole(email)).toBe(false);
  });

  it('accepte un domaine ajoute par configuration', () => {
    process.env.STUDENT_EMAIL_DOMAINS = 'ecole-exemple.fr, autre-ecole.org';

    expect(estUneAdresseDEcole('lea@ecole-exemple.fr')).toBe(true);
    expect(estUneAdresseDEcole('lea@promo2026.autre-ecole.org')).toBe(true);
    expect(estUneAdresseDEcole('lea@ecole-exemple.fr.evil.com')).toBe(false);
  });
});

describe('StudentService.envoyerUnCode', () => {
  it('refuse une adresse qui n est pas une adresse d ecole', async () => {
    const { service, emailSender } = creer();

    await expect(service.envoyerUnCode('user-1', 'lea@gmail.com')).rejects.toThrow(
      "adresse d'école",
    );

    expect(emailSender.send).not.toHaveBeenCalled();
  });

  it('envoie un code a six chiffres a l adresse d ecole', async () => {
    const { service, emailSender, prisma } = creer();

    await service.envoyerUnCode('user-1', 'Lea@Etu.Univ-Lyon1.fr');

    expect(emailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'lea@etu.univ-lyon1.fr' }),
    );
    expect(emailSender.send.mock.calls[0][0].subject).toMatch(/^\d{6} est votre code/);
    expect(prisma.studentVerification.upsert).toHaveBeenCalled();
  });

  it('fait patienter une minute entre deux envois', async () => {
    const { service, emailSender } = creer({
      enCours: {
        email: 'lea@etu.univ-lyon1.fr',
        codeHash: 'x',
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 0,
        createdAt: new Date(Date.now() - 10_000),
      },
    });

    await expect(
      service.envoyerUnCode('user-1', 'lea@etu.univ-lyon1.fr'),
    ).rejects.toThrow('Patientez');

    expect(emailSender.send).not.toHaveBeenCalled();
  });
});

describe('StudentService.confirmer', () => {
  function enCoursAvec(code: string, surcharges: Partial<{ expiresAt: Date; attempts: number }> = {}) {
    return {
      email: 'lea@etu.univ-lyon1.fr',
      codeHash: createHash('sha256').update(`user-1:${code}`).digest('hex'),
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
      createdAt: new Date(),
      ...surcharges,
    };
  }

  it('valide le statut pour un an et retient l adresse d ecole', async () => {
    const { service, prisma } = creer({ enCours: enCoursAvec('123456') });

    await service.confirmer('user-1', ' 123456 ');

    const donnees = prisma.user.update.mock.calls[0][0].data;

    expect(donnees.studentEmail).toBe('lea@etu.univ-lyon1.fr');
    expect(donnees.studentVerifiedUntil.getTime()).toBeGreaterThan(
      Date.now() + 364 * JOUR_MS,
    );
    expect(prisma.studentVerification.delete).toHaveBeenCalled();
  });

  it('compte les mauvais codes et refuse au bout de cinq', async () => {
    const { service, prisma } = creer({ enCours: enCoursAvec('123456', { attempts: 2 }) });

    await expect(service.confirmer('user-1', '000000')).rejects.toThrow('Code incorrect');

    expect(prisma.studentVerification.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { attempts: { increment: 1 } } }),
    );

    const epuise = creer({ enCours: enCoursAvec('123456', { attempts: 5 }) });

    await expect(epuise.service.confirmer('user-1', '123456')).rejects.toThrow(
      'Trop de tentatives',
    );
    expect(epuise.prisma.user.update).not.toHaveBeenCalled();
  });

  it('refuse un code perime', async () => {
    const { service } = creer({
      enCours: enCoursAvec('123456', { expiresAt: new Date(Date.now() - 1000) }),
    });

    await expect(service.confirmer('user-1', '123456')).rejects.toThrow(
      'Aucun code en cours',
    );
  });

  it('applique la remise a un abonnement deja ouvert chez Stripe', async () => {
    const declare = process.env.STRIPE_STUDENT_COUPON;
    process.env.STRIPE_STUDENT_COUPON = 'ETUDIANT50';

    const { service, provider } = creer({
      enCours: enCoursAvec('123456'),
      externalId: 'sub_456',
    });

    await service.confirmer('user-1', '123456');

    expect(provider.appliquerUneRemise).toHaveBeenCalledWith('sub_456', 'ETUDIANT50');

    if (declare === undefined) {
      delete process.env.STRIPE_STUDENT_COUPON;
    } else {
      process.env.STRIPE_STUDENT_COUPON = declare;
    }
  });
});
