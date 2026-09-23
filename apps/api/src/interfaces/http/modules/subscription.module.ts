import { Module } from '@nestjs/common';

import { ReferralService } from 'src/application/subscription/referral.service';
import { SubscriptionService } from 'src/application/subscription/subscription.service';
import { StudentService } from 'src/application/subscription/student.service';
import { ConsoleEmailSender } from 'src/infrastructure/notifications/console-email.sender';
import {
  NodemailerEmailSender,
  isSmtpConfigured,
} from 'src/infrastructure/notifications/nodemailer-email.sender';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { SimulatedPaymentProvider } from 'src/infrastructure/payment/simulated-payment.provider';
import {
  StripePaymentProvider,
  isStripePaymentConfigured,
} from 'src/infrastructure/payment/stripe-payment.provider';
import { StudentController } from '../controllers/student.controller';
import { SubscriptionController } from '../controllers/subscription.controller';
import { EMAIL_SENDER, PAYMENT_PROVIDER } from '../tokens/token';

@Module({
  controllers: [SubscriptionController, StudentController],
  providers: [
    PrismaService,
    ReferralService,
    SubscriptionService,
    StudentService,
    SimulatedPaymentProvider,
    StripePaymentProvider,
    ConsoleEmailSender,
    NodemailerEmailSender,
    {
      provide: EMAIL_SENDER,
      useFactory: (
        nodemailer: NodemailerEmailSender,
        console_: ConsoleEmailSender,
      ) => (isSmtpConfigured() ? nodemailer : console_),
      inject: [NodemailerEmailSender, ConsoleEmailSender],
    },
    {
      provide: PAYMENT_PROVIDER,
      useFactory: (
        stripe: StripePaymentProvider,
        simule: SimulatedPaymentProvider,
      ) => (isStripePaymentConfigured() ? stripe : simule),
      inject: [StripePaymentProvider, SimulatedPaymentProvider],
    },
  ],
  exports: [SubscriptionService, ReferralService, PAYMENT_PROVIDER],
})
export class SubscriptionModule {}
