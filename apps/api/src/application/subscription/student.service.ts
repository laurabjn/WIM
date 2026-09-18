import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { createHash, randomInt } from 'node:crypto';

import type { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { EMAIL_SENDER, PAYMENT_PROVIDER } from 'src/interfaces/http/tokens/token';
import { buildStudentCodeEmail } from 'src/shared/utils/student-code.template';
import type { PaymentProviderPort } from './ports/payment-provider.port';
import { estUneAdresseDEcole } from './student-domains';

const JOUR_MS = 24 * 60 * 60 * 1000;
const VALIDITE_JOURS = 365;
const VALIDITE_CODE_MINUTES = 15;
const DELAI_ENTRE_ENVOIS_MS = 60 * 1000;
const ESSAIS_MAX = 5;

export type EtatEtudiant = {
  etudiant: boolean;
  jusquAu: string | null;
  email: string | null;
  codeEnvoye: boolean;
};

export function bonEtudiant(): string | null {
  return process.env.STRIPE_STUDENT_COUPON?.trim() || null;
}

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSenderPort,
    @Inject(PAYMENT_PROVIDER)
    private readonly provider: PaymentProviderPort,
  ) {}

  async etat(userId: string): Promise<EtatEtudiant> {
    const [compte, enCours] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { studentEmail: true, studentVerifiedUntil: true },
      }),
      this.prisma.studentVerification.findUnique({ where: { userId } }),
    ]);

    return {
      etudiant: this.estEtudiant(compte?.studentVerifiedUntil ?? null),
      jusquAu: compte?.studentVerifiedUntil?.toISOString() ?? null,
      email: compte?.studentEmail ?? null,
      codeEnvoye: Boolean(enCours && enCours.expiresAt.getTime() > Date.now()),
    };
  }

  async estEtudiantActif(userId: string): Promise<boolean> {
    const compte = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { studentVerifiedUntil: true },
    });

    return this.estEtudiant(compte?.studentVerifiedUntil ?? null);
  }

  async envoyerUnCode(userId: string, email: string): Promise<EtatEtudiant> {
    const propre = email.trim().toLowerCase();

    if (!estUneAdresseDEcole(propre)) {
      throw new BadRequestException(
        "Cette adresse n'est pas reconnue comme une adresse d'école.",
      );
    }

    const precedent = await this.prisma.studentVerification.findUnique({
      where: { userId },
    });

    if (
      precedent &&
      Date.now() - precedent.createdAt.getTime() < DELAI_ENTRE_ENVOIS_MS
    ) {
      throw new BadRequestException(
        'Un code vient de partir. Patientez une minute avant d’en demander un autre.',
      );
    }

    const compte = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLocale: true },
    });

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAt = new Date(Date.now() + VALIDITE_CODE_MINUTES * 60 * 1000);

    await this.prisma.studentVerification.upsert({
      where: { userId },
      update: {
        email: propre,
        codeHash: this.empreinte(userId, code),
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      },
      create: {
        userId,
        email: propre,
        codeHash: this.empreinte(userId, code),
        expiresAt,
      },
    });

    const courriel = buildStudentCodeEmail(
      compte?.preferredLocale,
      code,
      VALIDITE_CODE_MINUTES,
    );

    await this.emailSender.send({
      to: propre,
      subject: courriel.subject,
      text: courriel.text,
      html: courriel.html,
    });

    return this.etat(userId);
  }

  async confirmer(userId: string, code: string): Promise<EtatEtudiant> {
    const enCours = await this.prisma.studentVerification.findUnique({
      where: { userId },
    });

    if (!enCours || enCours.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException(
        'Aucun code en cours de validité. Demandez-en un nouveau.',
      );
    }

    if (enCours.attempts >= ESSAIS_MAX) {
      throw new BadRequestException(
        'Trop de tentatives. Demandez un nouveau code.',
      );
    }

    if (this.empreinte(userId, code.trim()) !== enCours.codeHash) {
      await this.prisma.studentVerification.update({
        where: { userId },
        data: { attempts: { increment: 1 } },
      });

      throw new BadRequestException('Code incorrect.');
    }

    const jusquAu = new Date(Date.now() + VALIDITE_JOURS * JOUR_MS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { studentEmail: enCours.email, studentVerifiedUntil: jusquAu },
      }),
      this.prisma.studentVerification.delete({ where: { userId } }),
    ]);

    await this.appliquerLaRemise(userId);

    return this.etat(userId);
  }

  private async appliquerLaRemise(userId: string): Promise<void> {
    const bon = bonEtudiant();

    if (!bon) return;

    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { externalId: true },
    });

    if (!abonnement?.externalId) return;

    const applique = await this.provider
      .appliquerUneRemise(abonnement.externalId, bon)
      .catch((erreur: unknown) => {
        this.logger.warn(`Remise etudiante non appliquee : ${erreur}`);

        return false;
      });

    if (!applique) {
      this.logger.warn(`Remise etudiante refusee pour ${userId}.`);
    }
  }

  private estEtudiant(jusquAu: Date | null): boolean {
    return jusquAu !== null && jusquAu.getTime() > Date.now();
  }

  private empreinte(userId: string, code: string): string {
    return createHash('sha256').update(`${userId}:${code}`).digest('hex');
  }
}
