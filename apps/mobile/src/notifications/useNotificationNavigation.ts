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

export function useNotificationNavigation(pret: boolean): void {
  useEffect(() => {
    if (!pret) return;

    let traitee = false;

    function traiter(response: Notifications.NotificationResponse | null) {
      const chatId = response?.notification.request.content.data?.chatId;

      if (typeof chatId !== 'string' || traitee) return;

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
