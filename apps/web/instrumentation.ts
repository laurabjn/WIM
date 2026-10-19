import * as Sentry from '@sentry/nextjs';

export async function register() {
  const adresse = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

  if (!adresse) return;

  Sentry.init({
    dsn: adresse,
    environment: process.env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend(evenement) {
      if (evenement.request) {
        delete evenement.request.cookies;
        delete evenement.request.data;

        if (evenement.request.headers) {
          delete evenement.request.headers.authorization;
          delete evenement.request.headers.cookie;
        }
      }

      if (evenement.user) {
        evenement.user = { id: evenement.user.id };
      }

      return evenement;
    },
  });
}

export const onRequestError = Sentry.captureRequestError;
