import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { ReferralService } from 'src/application/subscription/referral.service';
import { SubscriptionService } from 'src/application/subscription/subscription.service';
import type { PlanAbonnement } from 'src/application/subscription/ports/payment-provider.port';
import { isPaymentProviderConfigured } from 'src/infrastructure/payment/simulated-payment.provider';
import { AdminGuard } from '../admin.guard';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { PAYMENT_PROVIDER } from '../tokens/token';
import { Inject } from '@nestjs/common';
import type { PaymentProviderPort } from 'src/application/subscription/ports/payment-provider.port';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email: string };
}

const PLANS: PlanAbonnement[] = ['MONTHLY', 'YEARLY'];

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptions: SubscriptionService,
    private readonly referrals: ReferralService,
    @Inject(PAYMENT_PROVIDER)
    private readonly provider: PaymentProviderPort,
  ) {}

  // Reservee a l'administration : ces chiffres n'ont rien a faire dans
  // l'application de qui que ce soit d'autre.
  @Get('analytics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async analyse() {
    return this.subscriptions.analyse();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async mien(@Req() req: AuthenticatedRequest) {
    return this.subscriptions.etat(req.user.sub);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async checkout(
    @Req() req: AuthenticatedRequest,
    @Body() body: { plan?: string },
  ) {
    const plan = PLANS.find((candidat) => candidat === body?.plan);

    if (!plan) {
      throw new BadRequestException('Formule inconnue.');
    }

    return this.subscriptions.demarrer(req.user.sub, plan);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async annuler(@Req() req: AuthenticatedRequest) {
    return this.subscriptions.annuler(req.user.sub);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-payment-signature') signature?: string,
  ) {
    if (!isPaymentProviderConfigured()) {
      throw new ServiceUnavailableException(
        "Aucun prestataire de paiement n'est configure.",
      );
    }

    if (!signature || !req.rawBody) {
      throw new BadRequestException('Signature manquante.');
    }

    let verdict;

    try {
      verdict = this.provider.lireEvenement(req.rawBody, signature);
    } catch {
      throw new BadRequestException('Signature invalide.');
    }

    if (verdict) {
      await this.subscriptions.appliquerVerdict(verdict);
    }

    return { received: true };
  }

  // Sans prestataire, rien ne peut confirmer un paiement : cette porte tient
  // lieu de retour de caisse en developpement, et se ferme des qu'un
  // prestataire existe ou que l'on tourne en production.
  @Post('simulate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async simuler(@Req() req: AuthenticatedRequest) {
    if (isPaymentProviderConfigured() || process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('La simulation est refusée ici.');
    }

    const etat = await this.subscriptions.etat(req.user.sub);

    if (etat.statut !== 'PENDING') {
      throw new BadRequestException('Aucun paiement en attente.');
    }

    const abonnement = await this.subscriptions.identifiantExterne(
      req.user.sub,
    );

    await this.subscriptions.appliquerVerdict({
      externalId: abonnement,
      statut: 'ACTIVE',
      finDePeriode: null,
    });

    return this.subscriptions.etat(req.user.sub);
  }

  @Get('referral')
  @UseGuards(JwtAuthGuard)
  async parrainage(@Req() req: AuthenticatedRequest) {
    return this.referrals.etat(req.user.sub);
  }

  @Post('referral')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async utiliserUnCode(
    @Req() req: AuthenticatedRequest,
    @Body() body: { code?: string },
  ) {
    await this.referrals.enregistrer(req.user.sub, body?.code ?? '');

    return this.referrals.etat(req.user.sub);
  }
}
