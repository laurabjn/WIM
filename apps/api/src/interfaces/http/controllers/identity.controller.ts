import {
  BadRequestException,
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

import { ApplyIdentityVerdictUseCase } from 'src/application/auth/use-cases/apply-identity-verdict.usecase';
import { GetIdentityStatusUseCase } from 'src/application/auth/use-cases/get-identity-status.usecase';
import { StartIdentityVerificationUseCase } from 'src/application/auth/use-cases/start-identity-verification.usecase';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';
import {
  StripeIdentityProvider,
  isStripeIdentityConfigured,
} from 'src/infrastructure/identity/stripe-identity.provider';
import { JwtAuthGuard, SansVerificationIdentite } from '../jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    isAdmin?: boolean;
  };
}

@Controller('identity')
@SansVerificationIdentite()
export class IdentityController {
  constructor(
    private readonly startIdentityVerificationUseCase: StartIdentityVerificationUseCase,
    private readonly getIdentityStatusUseCase: GetIdentityStatusUseCase,
    private readonly applyIdentityVerdictUseCase: ApplyIdentityVerdictUseCase,
    private readonly stripeIdentityProvider: StripeIdentityProvider,
  ) {}

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async start(@Req() req: AuthenticatedRequest) {
    return this.startIdentityVerificationUseCase.execute({
      userId: req.user.sub,
    });
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: AuthenticatedRequest) {
    return this.getIdentityStatusUseCase.execute({ userId: req.user.sub });
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!isStripeIdentityConfigured()) {
      throw new ServiceUnavailableException(
        "Aucune verification d'identite n'est configuree.",
      );
    }

    if (!signature || !req.rawBody) {
      throw new BadRequestException('Signature Stripe manquante.');
    }

    let verdict;

    try {
      verdict = this.stripeIdentityProvider.lireEvenement(
        req.rawBody,
        signature,
      );
    } catch {
      throw new BadRequestException('Signature Stripe invalide.');
    }

    if (verdict) {
      await this.applyIdentityVerdictUseCase.execute({
        userId: verdict.userId,
        status: verdict.status,
      });
    }

    return { received: true };
  }

  @Post('simulate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async simulate(@Req() req: AuthenticatedRequest) {
    if (
      isStripeIdentityConfigured() ||
      process.env.NODE_ENV === 'production'
    ) {
      throw new ForbiddenException(
        'La simulation est refusee hors developpement.',
      );
    }

    await this.applyIdentityVerdictUseCase.execute({
      userId: req.user.sub,
      status: IdentityStatus.VERIFIED,
    });

    return { status: IdentityStatus.VERIFIED };
  }
}
