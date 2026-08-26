import { Module } from '@nestjs/common';

import { ReferralService } from 'src/application/subscription/referral.service';
import { SubscriptionService } from 'src/application/subscription/subscription.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { SimulatedPaymentProvider } from 'src/infrastructure/payment/simulated-payment.provider';
import { SubscriptionController } from '../controllers/subscription.controller';
import { PAYMENT_PROVIDER } from '../tokens/token';

@Module({
  controllers: [SubscriptionController],
  providers: [
    PrismaService,
    ReferralService,
    SubscriptionService,
    SimulatedPaymentProvider,
    {
      // Un seul fournisseur existe aujourd'hui ; le jour ou un prestataire est
      // choisi, il se substitue ici sans que le reste bouge.
      provide: PAYMENT_PROVIDER,
      useExisting: SimulatedPaymentProvider,
    },
  ],
  exports: [SubscriptionService, ReferralService],
})
export class SubscriptionModule {}
