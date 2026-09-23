import { Logger, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

import type { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';
import type { IdentityVerificationProviderPort } from 'src/application/auth/ports/identity-verification-provider.port';
import type { PaymentProviderPort } from 'src/application/subscription/ports/payment-provider.port';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { buildAccountDeletedEmail } from 'src/shared/utils/account-deleted.template';

const PREFIXE_FICHIERS = '/uploads/';

export class DeleteAccountUseCase {
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: PaymentProviderPort,
    private readonly emailSender: EmailSenderPort,
    private readonly identite: IdentityVerificationProviderPort,
    private readonly dossierDesFichiers: string,
  ) {}

  async execute(userId: string): Promise<void> {
    const compte = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        avatarUrl: true,
        preferredLocale: true,
        identitySessionId: true,
        subscription: { select: { externalId: true } },
        homes: { select: { photos: { select: { url: true } } } },
      },
    });

    if (!compte) {
      throw new NotFoundException('Compte introuvable.');
    }

    if (compte.isAdmin) {
      throw new NotFoundException('Compte introuvable.');
    }

    const externalId = compte.subscription?.externalId;

    if (externalId && this.provider.reconnait(externalId)) {
      const efface = await this.provider.effacerLeClient(externalId);

      if (!efface) {
        this.logger.warn(
          `Client de paiement non efface pour ${userId} (${externalId}).`,
        );
      }
    }

    if (compte.identitySessionId) {
      const expurgee = await this.identite.effacer(compte.identitySessionId);

      if (!expurgee) {
        this.logger.warn(
          `Session d'identite non expurgee pour ${userId} (${compte.identitySessionId}).`,
        );
      }
    }

    const fichiers = [
      compte.avatarUrl,
      ...compte.homes.flatMap((logement) =>
        logement.photos.map((photo) => photo.url),
      ),
    ].filter((url): url is string => Boolean(url));

    await this.prisma.$transaction([
      this.prisma.chat.deleteMany({
        where: { participants: { some: { userId } } },
      }),
      this.prisma.match.deleteMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    await Promise.all(fichiers.map((url) => this.effacerLeFichier(url)));

    const courriel = buildAccountDeletedEmail(compte.preferredLocale);

    await this.emailSender
      .send({
        to: compte.email,
        subject: courriel.subject,
        text: courriel.text,
        html: courriel.html,
      })
      .catch((erreur: unknown) => {
        this.logger.warn(`Confirmation de suppression non envoyee : ${erreur}`);
      });

    this.logger.log(`Compte ${userId} supprime.`);
  }

  private async effacerLeFichier(url: string): Promise<void> {
    if (!url.startsWith(PREFIXE_FICHIERS)) return;

    const relatif = url.slice(PREFIXE_FICHIERS.length);

    if (relatif.includes('..')) return;

    await unlink(join(this.dossierDesFichiers, relatif)).catch(() => undefined);
  }
}
