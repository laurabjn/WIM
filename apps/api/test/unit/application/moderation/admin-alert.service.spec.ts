import { Logger } from '@nestjs/common';

import { AdminAlertService } from 'src/application/moderation/admin-alert.service';

describe('AdminAlertService', () => {
  const send = jest.fn();
  const service = new AdminAlertService({ send } as any);
  const initial = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    send.mockReset().mockResolvedValue(undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();

    if (initial === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = initial;
  });

  it('previent l administration avec le motif et la cible', async () => {
    process.env.ADMIN_EMAIL = 'moderation@worldismine.fr';

    await service.signalementRecu({
      reportId: 'rep-1',
      reason: 'Propos injurieux',
      message: 'Contenu signale',
      cible: 'un avis publie par Jean Dupont (jean@exemple.fr)',
    });

    expect(send).toHaveBeenCalledTimes(1);

    const envoi = send.mock.calls[0][0];

    expect(envoi.to).toBe('moderation@worldismine.fr');
    expect(envoi.subject).toContain('Propos injurieux');
    expect(envoi.text).toContain('jean@exemple.fr');
    expect(envoi.text).toContain('Contenu signale');
    expect(envoi.text).toContain('rep-1');
  });

  it('n envoie rien si aucune adresse d administration n est configuree', async () => {
    delete process.env.ADMIN_EMAIL;

    await service.signalementRecu({
      reportId: 'rep-2',
      reason: 'Spam',
      message: null,
      cible: 'un compte',
    });

    expect(send).not.toHaveBeenCalled();
  });

  it('n echoue pas quand le serveur de mail est injoignable', async () => {
    process.env.ADMIN_EMAIL = 'moderation@worldismine.fr';
    send.mockRejectedValue(new Error('SMTP injoignable'));

    await expect(
      service.signalementRecu({
        reportId: 'rep-3',
        reason: 'Spam',
        message: null,
        cible: 'un compte',
      }),
    ).resolves.toBeUndefined();
  });
});
