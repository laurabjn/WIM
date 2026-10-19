import * as Sentry from '@sentry/nextjs';

const ADRESSE = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

if (ADRESSE) {
  Sentry.init({
    dsn: ADRESSE,
    environment: process.env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend(evenement) {
      if (evenement.user) {
        evenement.user = { id: evenement.user.id };
      }

      return evenement;
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
