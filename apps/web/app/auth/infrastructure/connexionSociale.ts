const ID_GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const ID_APPLE = process.env.NEXT_PUBLIC_APPLE_SERVICE_ID ?? '';

const SCRIPT_GOOGLE = 'https://accounts.google.com/gsi/client';
const SCRIPT_APPLE =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/fr_FR/appleid.auth.js';

type ReponseGoogle = { credential?: string };

type ReponseApple = { authorization?: { id_token?: string } };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (reponse: ReponseGoogle) => void;
          }) => void;
          prompt: (ecoute?: (avis: { isSkippedMoment: () => boolean }) => void) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (options: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<ReponseApple>;
      };
    };
  }
}

export const googleEstConfigure = ID_GOOGLE.length > 0;
export const appleEstConfigure = ID_APPLE.length > 0;

function chargerScript(source: string): Promise<void> {
  return new Promise((resoudre, rejeter) => {
    const dejaLa = document.querySelector(`script[src="${source}"]`);

    if (dejaLa) {
      resoudre();
      return;
    }

    const balise = document.createElement('script');
    balise.src = source;
    balise.async = true;
    balise.onload = () => resoudre();
    balise.onerror = () => rejeter(new Error(`Script injoignable : ${source}`));

    document.head.appendChild(balise);
  });
}

export async function jetonGoogle(): Promise<string | null> {
  if (!googleEstConfigure) return null;

  await chargerScript(SCRIPT_GOOGLE);

  const identite = window.google?.accounts.id;

  if (!identite) return null;

  return new Promise((resoudre) => {
    identite.initialize({
      client_id: ID_GOOGLE,
      callback: (reponse) => resoudre(reponse.credential ?? null),
    });

    identite.prompt((avis) => {
      if (avis.isSkippedMoment()) resoudre(null);
    });
  });
}

export async function jetonApple(): Promise<string | null> {
  if (!appleEstConfigure) return null;

  await chargerScript(SCRIPT_APPLE);

  const authentification = window.AppleID?.auth;

  if (!authentification) return null;

  authentification.init({
    clientId: ID_APPLE,
    scope: 'name email',
    redirectURI: window.location.origin,
    usePopup: true,
  });

  const reponse = await authentification.signIn();

  return reponse?.authorization?.id_token ?? null;
}
