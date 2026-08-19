import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import {
  createNavigationContainerRef,
  type NavigationContainerRef,
} from '@react-navigation/native';

// Hors de l'arbre de composants : la reponse a une notification arrive avant
// que le moindre ecran ne soit monte.
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

/**
 * Ouvre la conversation visee par une notification touchee.
 *
 * Deux cas a couvrir : l'application etait ouverte et recoit l'evenement, ou
 * elle etait fermee et c'est la notification qui l'a lancee — la reponse est
 * alors deja disponible au demarrage.
 */
export function useNotificationNavigation(pret: boolean): void {
  useEffect(() => {
    if (!pret) return;

    let traitee = false;

    function traiter(response: Notifications.NotificationResponse | null) {
      const chatId = response?.notification.request.content.data?.chatId;

      if (typeof chatId !== 'string' || traitee) return;

      traitee = true;

      // Le conteneur de navigation peut n'etre pret qu'apres ce tour de boucle.
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
