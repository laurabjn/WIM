import { Module } from '@nestjs/common';

import { ReferralService } from 'src/application/subscription/referral.service';
import { SubscriptionService } from 'src/application/subscription/subscription.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { SimulatedPaymentProvider } from 'src/infrastructure/payment/simulated-payment.provider';
import {
  StripePaymentProvider,
  isStripePaymentConfigured,
} from 'src/infrastructure/payment/stripe-payment.provider';
import { SubscriptionController } from '../controllers/subscription.controller';
import { PAYMENT_PROVIDER } from '../tokens/token';

@Module({
  controllers: [SubscriptionController],
  providers: [
    PrismaService,
    ReferralService,
    SubscriptionService,
    SimulatedPaymentProvider,
    StripePaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      useFactory: (
        stripe: StripePaymentProvider,
        simule: SimulatedPaymentProvider,
      ) => (isStripePaymentConfigured() ? stripe : simule),
      inject: [StripePaymentProvider, SimulatedPaymentProvider],
    },
  ],
  exports: [SubscriptionService, ReferralService],
})
export class SubscriptionModule {}
