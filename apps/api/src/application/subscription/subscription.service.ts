import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { PAYMENT_PROVIDER } from 'src/interfaces/http/tokens/token';
import type {
  PaymentProviderPort,
  PlanAbonnement,
  VerdictPaiement,
} from './ports/payment-provider.port';
import { ReferralService } from './referral.service';

const JOUR_MS = 24 * 60 * 60 * 1000;

const DUREE_JOURS: Record<PlanAbonnement, number> = {
  MONTHLY: 30,
  YEARLY: 365,
};

export type EtatAbonnement = {
  actif: boolean;
  plan: PlanAbonnement | null;
  statut: string;
  finDePeriode: string | null;
  annuleLe: string | null;
};

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly referrals: ReferralService,
    @Inject(PAYMENT_PROVIDER)
    private readonly provider: PaymentProviderPort,
  ) {}

  async etat(userId: string): Promise<EtatAbonnement> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!abonnement) {
      return {
        actif: false,
        plan: null,
        statut: 'NONE',
        finDePeriode: null,
        annuleLe: null,
      };
    }

    return {
      actif: this.estEnCours(abonnement),
      plan: abonnement.plan,
      statut: abonnement.status,
      finDePeriode: abonnement.currentPeriodEnd?.toISOString() ?? null,
      annuleLe: abonnement.cancelledAt?.toISOString() ?? null,
    };
  }

  // Une periode payee court jusqu'a son terme meme apres une annulation : c'est
  // du temps deja regle.
  async estActif(userId: string): Promise<boolean> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { status: true, currentPeriodEnd: true },
    });

    return this.estEnCours(abonnement);
  }

  // Ce que l'administration a besoin de savoir : combien paient, combien sont
  // partis, et si le parrainage rapporte autre chose que des codes generes.
  async analyse() {
    const maintenant = new Date();

    const [parStatut, actifs, parPlan, parrainages, recompenses, codes] =
      await Promise.all([
        this.prisma.subscription.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.subscription.count({
          where: {
            status: { in: ['ACTIVE', 'CANCELLED'] },
            currentPeriodEnd: { gt: maintenant },
          },
        }),
        this.prisma.subscription.groupBy({
          by: ['plan'],
          where: {
            status: { in: ['ACTIVE', 'CANCELLED'] },
            currentPeriodEnd: { gt: maintenant },
          },
          _count: { _all: true },
        }),
        this.prisma.referral.count(),
        this.prisma.referral.count({ where: { rewardedAt: { not: null } } }),
        this.prisma.user.count({ where: { referralCode: { not: null } } }),
      ]);

    return {
      abonnes: actifs,
      parStatut: Object.fromEntries(
        parStatut.map((ligne) => [ligne.status, ligne._count._all]),
      ),
      parPlan: Object.fromEntries(
        parPlan.map((ligne) => [ligne.plan, ligne._count._all]),
      ),
      parrainage: {
        codesGeneres: codes,
        filleuls: parrainages,
        recompenses,
        // Un code partage qui n'aboutit jamais coute autant qu'aucun code.
        tauxConversion:
          parrainages === 0
            ? 0
            : Math.round((recompenses / parrainages) * 100),
      },
    };
  }

  async demarrer(
    userId: string,
    plan: PlanAbonnement,
  ): Promise<{ url: string }> {
    if (await this.estActif(userId)) {
      throw new BadRequestException('Votre abonnement est déjà actif.');
    }

    const personne = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!personne) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const paiement = await this.provider.creerPaiement({
      userId,
      email: personne.email,
      plan,
    });

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status: 'PENDING',
        externalId: paiement.externalId,
        cancelledAt: null,
      },
      create: {
        userId,
        plan,
        status: 'PENDING',
        externalId: paiement.externalId,
      },
    });

    return { url: paiement.url };
  }

  async identifiantExterne(userId: string): Promise<string> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { externalId: true },
    });

    if (!abonnement?.externalId) {
      throw new NotFoundException('Aucun paiement en attente.');
    }

    return abonnement.externalId;
  }

  async appliquerVerdict(verdict: VerdictPaiement): Promise<void> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { externalId: verdict.externalId },
    });

    if (!abonnement) return;

    if (verdict.statut !== 'ACTIVE') {
      await this.prisma.subscription.update({
        where: { id: abonnement.id },
        data: {
          status: verdict.statut,
          cancelledAt: verdict.statut === 'CANCELLED' ? new Date() : null,
        },
      });

      return;
    }

    const premiereActivation = abonnement.startedAt === null;

    await this.prisma.subscription.update({
      where: { id: abonnement.id },
      data: {
        status: 'ACTIVE',
        startedAt: abonnement.startedAt ?? new Date(),
        currentPeriodEnd:
          verdict.finDePeriode ?? this.finParDefaut(abonnement.plan),
        cancelledAt: null,
      },
    });

    // Le parrainage se paie sur une conversion reelle, pas sur une intention :
    // il attend la premiere activation.
    if (premiereActivation) {
      await this.referrals.recompenser(abonnement.userId, (userId, jours) =>
        this.offrirDesJours(userId, jours),
      );
    }
  }

  async annuler(userId: string): Promise<EtatAbonnement> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!abonnement || abonnement.status === 'CANCELLED') {
      throw new BadRequestException("Aucun abonnement à annuler.");
    }

    await this.prisma.subscription.update({
      where: { id: abonnement.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    return this.etat(userId);
  }

  // Un mois offert prolonge ce qui court deja, ou ouvre une periode a partir
  // d'aujourd'hui : offrir du temps a quelqu'un qui n'a rien ne doit pas le
  // dater dans le passe.
  async offrirDesJours(userId: string, jours: number): Promise<void> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { id: true, currentPeriodEnd: true, plan: true },
    });

    const maintenant = Date.now();

    const depart = Math.max(
      abonnement?.currentPeriodEnd?.getTime() ?? maintenant,
      maintenant,
    );

    const fin = new Date(depart + jours * JOUR_MS);

    if (!abonnement) {
      await this.prisma.subscription.create({
        data: {
          userId,
          plan: 'MONTHLY',
          status: 'ACTIVE',
          startedAt: new Date(),
          currentPeriodEnd: fin,
        },
      });

      return;
    }

    await this.prisma.subscription.update({
      where: { id: abonnement.id },
      data: { status: 'ACTIVE', currentPeriodEnd: fin },
    });
  }

  private estEnCours(
    abonnement: { status: string; currentPeriodEnd: Date | null } | null,
  ): boolean {
    if (!abonnement) return false;

    if (!['ACTIVE', 'CANCELLED'].includes(abonnement.status)) return false;

    return (abonnement.currentPeriodEnd?.getTime() ?? 0) > Date.now();
  }

  private finParDefaut(plan: PlanAbonnement): Date {
    return new Date(Date.now() + DUREE_JOURS[plan] * JOUR_MS);
  }
}
