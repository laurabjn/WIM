import { useCallback, useEffect, useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import { saveSession } from 'src/auth/infrastructure/authStorage';
import {
  signInWithProviderApi,
  type Fournisseur,
} from 'src/auth/infrastructure/social.api';
import { registerPushToken } from 'src/notifications/pushRegistration';

type Options = {
  onConnecte: () => void;
  onErreur: (message: string) => void;
};

export function useConnexionSociale({ onConnecte, onErreur }: Options) {
  const [enCours, setEnCours] = useState<Fournisseur | null>(null);
  const [appleDisponible, setAppleDisponible] = useState(false);

  const identifiantWeb = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  useEffect(() => {
    if (!identifiantWeb) return;

    GoogleSignin.configure({
      webClientId: identifiantWeb,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }, [identifiantWeb]);

  const connecter = useCallback(
    async (
      fournisseur: Fournisseur,
      jeton: string,
      prenom?: string | null,
      nom?: string | null,
    ) => {
      try {
        setEnCours(fournisseur);

        const resultat = await signInWithProviderApi(
          fournisseur,
          jeton,
          prenom,
          nom,
        );

        await saveSession({
          user: {
            id: resultat.user.id,
            email: resultat.user.email,
            firstName: resultat.user.firstName ?? null,
            lastName: resultat.user.lastName ?? null,
            isAdmin: resultat.user.isAdmin ?? false,
          },
          accessToken: resultat.accessToken,
          refreshToken: resultat.refreshToken,
        });

        await registerPushToken();

        onConnecte();
      } catch (erreur: any) {
        onErreur(erreur?.message ?? 'La connexion a echoue');
      } finally {
        setEnCours(null);
      }
    },
    [onConnecte, onErreur],
  );

  useEffect(() => {
    AppleAuthentication.isAvailableAsync()
      .then(setAppleDisponible)
      .catch(() => setAppleDisponible(false));
  }, []);

  const connecterGoogle = useCallback(async () => {
    try {
      setEnCours('GOOGLE');

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const reponse = await GoogleSignin.signIn();

      if (!isSuccessResponse(reponse)) return;

      const jeton = reponse.data.idToken;

      if (!jeton) {
        onErreur('La connexion a echoue');
        return;
      }

      await connecter(
        'GOOGLE',
        jeton,
        reponse.data.user.givenName,
        reponse.data.user.familyName,
      );
    } catch (erreur: any) {
      onErreur(erreur?.message ?? 'La connexion a echoue');
    } finally {
      setEnCours(null);
    }
  }, [connecter, onErreur]);

  const connecterApple = useCallback(async () => {
    try {
      setEnCours('APPLE');

      const identifiants = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!identifiants.identityToken) {
        onErreur('La connexion a echoue');
        return;
      }

      await connecter(
        'APPLE',
        identifiants.identityToken,
        identifiants.fullName?.givenName,
        identifiants.fullName?.familyName,
      );
    } catch (erreur: any) {
      if (erreur?.code !== 'ERR_REQUEST_CANCELED') {
        onErreur(erreur?.message ?? 'La connexion a echoue');
      }
    } finally {
      setEnCours(null);
    }
  }, [connecter, onErreur]);

  return {
    enCours,
    googleDisponible: Boolean(identifiantWeb),
    appleDisponible,
    connecterGoogle,
    connecterApple,
  };
}
