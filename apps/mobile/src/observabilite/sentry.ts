import * as Sentry from '@sentry/react-native';

const ADRESSE = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const remonteeActive = Boolean(ADRESSE);

export function demarrerLaRemonteeDesErreurs(): void {
  if (!ADRESSE) return;

  Sentry.init({
    dsn: ADRESSE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    enableAutoPerformanceTracing: false,
    attachScreenshot: false,
    attachViewHierarchy: false,
    environment: __DEV__ ? 'development' : 'production',
    beforeSend(evenement) {
      if (evenement.user) {
        evenement.user = { id: evenement.user.id };
      }

      return evenement;
    },
  });
}

export function associerLeCompte(userId: string | null): void {
  if (!ADRESSE) return;

  Sentry.setUser(userId ? { id: userId } : null);
}
