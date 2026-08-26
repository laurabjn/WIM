import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LONGUEUR = 7;
const JOURS_OFFERTS = 30;

export type EtatParrainage = {
  code: string;
  filleuls: number;
  recompenses: number;
  parraine: boolean;
};

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(private readonly prisma: PrismaService) {}

  async etat(userId: string): Promise<EtatParrainage> {
    const code = await this.code(userId);

    const [filleuls, recompenses, recu] = await Promise.all([
      this.prisma.referral.count({ where: { referrerId: userId } }),
      this.prisma.referral.count({
        where: { referrerId: userId, rewardedAt: { not: null } },
      }),
      this.prisma.referral.findUnique({ where: { refereeId: userId } }),
    ]);

    return { code, filleuls, recompenses, parraine: Boolean(recu) };
  }

  // Le code ne sert a rien tant qu'il n'existe pas : on le cree au premier
  // besoin plutot qu'a l'inscription, ce qui evite d'en generer pour des
  // comptes qui ne partageront jamais rien.
  async code(userId: string): Promise<string> {
    const personne = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (personne?.referralCode) return personne.referralCode;

    for (let essai = 0; essai < 5; essai += 1) {
      const candidat = this.tirer();

      try {
        const mis = await this.prisma.user.update({
          where: { id: userId },
          data: { referralCode: candidat },
          select: { referralCode: true },
        });

        return mis.referralCode as string;
      } catch {
        this.logger.warn(`Code de parrainage deja pris : ${candidat}`);
      }
    }

    throw new BadRequestException(
      'Impossible de générer un code de parrainage.',
    );
  }

  async enregistrer(refereeId: string, code: string): Promise<void> {
    const propre = code.trim().toUpperCase();

    if (!propre) {
      throw new BadRequestException('Code de parrainage manquant.');
    }

    const parrain = await this.prisma.user.findUnique({
      where: { referralCode: propre },
      select: { id: true },
    });

    if (!parrain) {
      throw new BadRequestException('Ce code de parrainage est inconnu.');
    }

    if (parrain.id === refereeId) {
      throw new BadRequestException(
        'Vous ne pouvez pas utiliser votre propre code.',
      );
    }

    const deja = await this.prisma.referral.findUnique({
      where: { refereeId },
    });

    if (deja) {
      throw new BadRequestException('Vous avez déjà été parrainé.');
    }

    await this.prisma.referral.create({
      data: { referrerId: parrain.id, refereeId },
    });
  }

  // Les deux cotes gagnent, et seulement une fois : sans cette marque, chaque
  // renouvellement rouvrirait un mois offert.
  async recompenser(
    refereeId: string,
    offrir: (userId: string, jours: number) => Promise<void>,
  ): Promise<void> {
    const parrainage = await this.prisma.referral.findUnique({
      where: { refereeId },
    });

    if (!parrainage || parrainage.rewardedAt) return;

    await this.prisma.referral.update({
      where: { id: parrainage.id },
      data: { rewardedAt: new Date() },
    });

    await offrir(parrainage.referrerId, JOURS_OFFERTS);
    await offrir(refereeId, JOURS_OFFERTS);
  }

  private tirer(): string {
    let code = '';

    for (let index = 0; index < LONGUEUR; index += 1) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }

    return code;
  }
}
