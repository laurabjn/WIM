import * as Sentry from '@sentry/nestjs';

const ADRESSE = process.env.SENTRY_DSN?.trim();

if (ADRESSE) {
  Sentry.init({
    dsn: ADRESSE,
    environment: process.env.NODE_ENV ?? 'development',
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend(evenement) {
      if (evenement.request) {
        delete evenement.request.cookies;
        delete evenement.request.data;

        if (evenement.request.headers) {
          delete evenement.request.headers.authorization;
          delete evenement.request.headers.cookie;
          delete evenement.request.headers['x-platform'];
        }
      }

      if (evenement.user) {
        evenement.user = { id: evenement.user.id };
      }

      return evenement;
    },
  });
}
