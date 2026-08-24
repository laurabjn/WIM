import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import {
  createNavigationContainerRef,
  type NavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef =
  createNavigationContainerRef<Record<string, object | undefined>>();

function ouvrirConversation(chatId: string) {
  if (!navigationRef.isReady()) return;

  const cible = navigationRef as NavigationContainerRef<any>;

  cible.navigate('MessagesTab', {
    screen: 'Conversation',
    params: { chatId },
  });
}

function ouvrirLesEchanges() {
  if (!navigationRef.isReady()) return;

  const cible = navigationRef as NavigationContainerRef<any>;

  cible.navigate('ExchangeTab', { screen: 'Exchanges' });
}

export function useNotificationNavigation(pret: boolean): void {
  useEffect(() => {
    if (!pret) return;

    let traitee = false;

    function traiter(response: Notifications.NotificationResponse | null) {
      if (traitee) return;

      const donnees = response?.notification.request.content.data;

      const chatId = donnees?.chatId;
      const reviewExchangeId = donnees?.reviewExchangeId;

      if (typeof reviewExchangeId === 'string') {
        traitee = true;

        setTimeout(ouvrirLesEchanges, 0);

        return;
      }

      if (typeof chatId !== 'string') return;

      traitee = true;

      setTimeout(() => ouvrirConversation(chatId), 0);
    }

    Notifications.getLastNotificationResponseAsync().then(traiter);

    const abonnement =
      Notifications.addNotificationResponseReceivedListener((response) => {
        traitee = false;
        traiter(response);
      });

    return () => abonnement.remove();
  }, [pret]);
}
