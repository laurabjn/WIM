import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import { useConnexionSociale } from './useConnexionSociale';
import { saveSession } from 'src/auth/infrastructure/authStorage';
import { signInWithProviderApi } from 'src/auth/infrastructure/social.api';
import { registerPushToken } from 'src/notifications/pushRegistration';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signOut: jest.fn().mockResolvedValue(undefined),
    signIn: jest.fn(),
  },
  isSuccessResponse: jest.fn(),
}));

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

jest.mock('src/auth/infrastructure/authStorage', () => ({
  saveSession: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('src/auth/infrastructure/social.api', () => ({
  signInWithProviderApi: jest.fn(),
}));

jest.mock('src/notifications/pushRegistration', () => ({
  registerPushToken: jest.fn().mockResolvedValue(null),
}));

const connexion = jest.mocked(signInWithProviderApi);
const reussite = jest.mocked(isSuccessResponse);

describe('useConnexionSociale', () => {
  const onConnecte = jest.fn();
  const onErreur = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'client-web';
  });

  function monter() {
    return renderHook(() => useConnexionSociale({ onConnecte, onErreur }));
  }

  it('enregistre la session et previent le parent apres un succes', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      data: {
        idToken: 'jeton-google',
        user: { givenName: 'Lea', familyName: 'Martin' },
      },
    });
    reussite.mockReturnValue(true);

    connexion.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'lea@exemple.fr',
        firstName: 'Lea',
        lastName: 'Martin',
        isAdmin: false,
      },
      accessToken: 'acces',
      refreshToken: 'refraichir',
    });

    const { result } = monter();

    await act(async () => {
      await result.current.connecterGoogle();
    });

    await waitFor(() => expect(onConnecte).toHaveBeenCalled());

    expect(connexion).toHaveBeenCalledWith(
      'GOOGLE',
      'jeton-google',
      'Lea',
      'Martin',
    );
    expect(saveSession).toHaveBeenCalled();
    expect(registerPushToken).toHaveBeenCalled();
    expect(onErreur).not.toHaveBeenCalled();
  });

  it('oublie le compte precedent pour laisser choisir a chaque fois', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({ data: null });
    reussite.mockReturnValue(false);

    const { result } = monter();

    await act(async () => {
      await result.current.connecterGoogle();
    });

    expect(GoogleSignin.signOut).toHaveBeenCalled();
  });

  it('ne signale rien quand la personne renonce', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({ type: 'cancelled' });
    reussite.mockReturnValue(false);

    const { result } = monter();

    await act(async () => {
      await result.current.connecterGoogle();
    });

    expect(connexion).not.toHaveBeenCalled();
    expect(onErreur).not.toHaveBeenCalled();
    expect(onConnecte).not.toHaveBeenCalled();
  });

  it('signale un refus venu du serveur', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      data: { idToken: 'jeton', user: {} },
    });
    reussite.mockReturnValue(true);
    connexion.mockRejectedValue(new Error('Compte suspendu'));

    const { result } = monter();

    await act(async () => {
      await result.current.connecterGoogle();
    });

    await waitFor(() =>
      expect(onErreur).toHaveBeenCalledWith('Compte suspendu'),
    );
    expect(onConnecte).not.toHaveBeenCalled();
  });

  it('laisse le bouton Google inerte sans identifiant configure', () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    const { result } = monter();

    expect(result.current.googleDisponible).toBe(false);
    expect(GoogleSignin.configure).not.toHaveBeenCalled();
  });
});
