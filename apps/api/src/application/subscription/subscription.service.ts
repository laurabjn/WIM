import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { PAYMENT_PROVIDER } from 'src/interfaces/http/tokens/token';
import type {
  Devise,
  MoyenDePaiement,
  PaymentProviderPort,
  PlanAbonnement,
  TarifsParPlan,
  VerdictPaiement,
} from './ports/payment-provider.port';
import { ReferralService } from './referral.service';
import { bonEtudiant } from './student.service';

const JOUR_MS = 24 * 60 * 60 * 1000;

const DUREE_JOURS: Record<PlanAbonnement, number> = {
  MONTHLY: 30,
  YEARLY: 365,
};

export type EtatAbonnement = {
  actif: boolean;
  accesLibreJusquAu: string | null;
  etudiant: boolean;
  facturable: boolean;
  plan: PlanAbonnement | null;
  statut: string;
  finDePeriode: string | null;
  annuleLe: string | null;
  tarifs: TarifsParPlan;
  venteDansLApp: boolean;
};

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly referrals: ReferralService,
    @Inject(PAYMENT_PROVIDER)
    private readonly provider: PaymentProviderPort,
  ) {}

  async etat(userId: string, plateforme?: string): Promise<EtatAbonnement> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const compte = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true, studentVerifiedUntil: true },
    });

    const devise = this.deviseDe(compte?.currency);

    const tarifs = await this.provider
      .tarifs(devise)
      .catch(() => ({ MONTHLY: null, YEARLY: null }) as TarifsParPlan);

    const accesLibre = this.accesLibreJusquAu();
    const etudiant = (compte?.studentVerifiedUntil?.getTime() ?? 0) > Date.now();

    if (!abonnement) {
      return {
        actif: accesLibre !== null,
        accesLibreJusquAu: accesLibre?.toISOString() ?? null,
        etudiant,
        facturable: false,
        plan: null,
        statut: 'NONE',
        finDePeriode: null,
        annuleLe: null,
        tarifs,
        venteDansLApp: this.venteAutorisee(plateforme),
      };
    }

    return {
      actif: accesLibre !== null || this.estEnCours(abonnement),
      accesLibreJusquAu: accesLibre?.toISOString() ?? null,
      etudiant,
      facturable: abonnement.externalId
        ? this.provider.reconnait(abonnement.externalId)
        : false,
      plan: abonnement.plan,
      statut: abonnement.status,
      finDePeriode: abonnement.currentPeriodEnd?.toISOString() ?? null,
      annuleLe: abonnement.cancelledAt?.toISOString() ?? null,
      tarifs,
      venteDansLApp: this.venteAutorisee(plateforme),
    };
  }

  venteAutorisee(plateforme?: string): boolean {
    const fermees = (process.env.SUBSCRIPTION_SALE_DISABLED_PLATFORMS ?? '')
      .split(',')
      .map((nom) => nom.trim().toLowerCase())
      .filter(Boolean);

    if (fermees.length === 0) return true;

    return !fermees.includes((plateforme ?? '').trim().toLowerCase());
  }

  // Une periode payee court jusqu'a son terme meme apres une annulation : c'est
  // du temps deja regle.
  async estActif(userId: string): Promise<boolean> {
    if (this.accesLibreJusquAu()) return true;

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
    const accesLibre = this.accesLibreJusquAu();

    if (accesLibre) {
      throw new BadRequestException(
        `L'accès est libre jusqu'au ${accesLibre.toLocaleDateString('fr-FR')}.`,
      );
    }

    if (await this.estActif(userId)) {
      throw new BadRequestException('Votre abonnement est déjà actif.');
    }

    const personne = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, studentVerifiedUntil: true, currency: true },
    });

    if (!personne) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const bon = bonEtudiant();
    const etudiant =
      (personne.studentVerifiedUntil?.getTime() ?? 0) > Date.now();

    const paiement = await this.provider.creerPaiement({
      userId,
      email: personne.email,
      plan,
      devise: this.deviseDe(personne.currency),
      ...(etudiant && bon ? { coupon: bon } : {}),
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

  async portail(userId: string): Promise<{ url: string }> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { externalId: true },
    });

    if (!abonnement?.externalId) {
      throw new NotFoundException("Aucun abonnement a gerer.");
    }

    const url = await this.provider.ouvrirLePortail(abonnement.externalId);

    if (!url) {
      throw new ServiceUnavailableException(
        "La gestion de l'abonnement est indisponible.",
      );
    }

    return { url };
  }

  async moyensDePaiement(userId: string): Promise<MoyenDePaiement[]> {
    const externalId = await this.identifiantDuCompte(userId);

    return externalId ? this.provider.moyensDePaiement(externalId) : [];
  }

  async definirLeMoyenPrincipal(
    userId: string,
    moyenId: string,
  ): Promise<MoyenDePaiement[]> {
    const externalId = await this.identifiantDuCompte(userId);

    if (!externalId) {
      throw new NotFoundException('Aucun abonnement.');
    }

    if (!(await this.provider.definirLeMoyenPrincipal(externalId, moyenId))) {
      throw new NotFoundException('Moyen de paiement introuvable.');
    }

    return this.provider.moyensDePaiement(externalId);
  }

  async retirerLeMoyen(
    userId: string,
    moyenId: string,
  ): Promise<MoyenDePaiement[]> {
    const externalId = await this.identifiantDuCompte(userId);

    if (!externalId) {
      throw new NotFoundException('Aucun abonnement.');
    }

    if (!(await this.provider.retirerLeMoyen(externalId, moyenId))) {
      throw new NotFoundException('Moyen de paiement introuvable.');
    }

    return this.provider.moyensDePaiement(externalId);
  }

  async ajouterUnMoyen(userId: string): Promise<{ url: string }> {
    const externalId = await this.identifiantDuCompte(userId);

    if (!externalId) {
      throw new NotFoundException('Aucun abonnement.');
    }

    const url = await this.provider.ajouterUnMoyen(externalId);

    if (!url) {
      throw new ServiceUnavailableException(
        "L'ajout d'un moyen de paiement est indisponible.",
      );
    }

    return { url };
  }

  private async identifiantDuCompte(userId: string): Promise<string | null> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { externalId: true },
    });

    return abonnement?.externalId ?? null;
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

    const identifiantDurable =
      verdict.nouvelExternalId && verdict.nouvelExternalId !== abonnement.externalId
        ? { externalId: verdict.nouvelExternalId }
        : {};

    if (verdict.statut !== 'ACTIVE') {
      await this.prisma.subscription.update({
        where: { id: abonnement.id },
        data: {
          ...identifiantDurable,
          status: verdict.statut,
          cancelledAt: verdict.statut === 'CANCELLED' ? new Date() : null,
        },
      });

      return;
    }

    await this.prisma.subscription.update({
      where: { id: abonnement.id },
      data: {
        ...identifiantDurable,
        status: 'ACTIVE',
        startedAt: abonnement.startedAt ?? new Date(),
        currentPeriodEnd:
          verdict.finDePeriode ?? this.finParDefaut(abonnement.plan),
        cancelledAt: null,
      },
    });

  }

  async recompenserLeParrainage(refereeId: string): Promise<void> {
    await this.referrals.recompenser(refereeId, (userId, jours) =>
      this.offrirDesJours(userId, jours),
    );
  }

  async annuler(userId: string): Promise<EtatAbonnement> {
    const abonnement = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!abonnement || abonnement.status === 'CANCELLED') {
      throw new BadRequestException("Aucun abonnement à annuler.");
    }

    if (abonnement.externalId) {
      const transmise = await this.provider.resilier(abonnement.externalId);

      if (!transmise) {
        throw new ServiceUnavailableException(
          "La résiliation n'a pas pu être transmise au prestataire de paiement.",
        );
      }
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
      select: { id: true, currentPeriodEnd: true, plan: true, externalId: true },
    });

    const maintenant = Date.now();

    const depart = Math.max(
      abonnement?.currentPeriodEnd?.getTime() ?? maintenant,
      this.accesLibreJusquAu()?.getTime() ?? maintenant,
      maintenant,
    );

    const finChezLePrestataire = abonnement?.externalId
      ? await this.provider.offrirDesJours(abonnement.externalId, jours)
      : null;

    const fin = finChezLePrestataire ?? new Date(depart + jours * JOUR_MS);

    if (!abonnement) {
      await this.prisma.subscription.create({
        data: {
          userId,
          plan: 'YEARLY',
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

  private deviseDe(valeur: string | null | undefined): Devise {
    return valeur === 'USD' ? 'USD' : 'EUR';
  }

  accesLibreJusquAu(): Date | null {
    const declare = process.env.SUBSCRIPTION_REQUIRED_FROM?.trim();

    if (!declare) return null;

    const date = new Date(declare);

    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      return null;
    }

    return date;
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
