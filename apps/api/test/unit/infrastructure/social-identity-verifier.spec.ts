import { createSign, generateKeyPairSync } from 'node:crypto';

import { verifierJeton } from 'src/infrastructure/auth/social-identity.verifier';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const cle = publicKey.export({ format: 'jwk' }) as Record<string, unknown>;

const EMETTEURS = ['https://accounts.google.com'];
const AUDIENCES = ['identifiant-web.apps.googleusercontent.com'];

function signer(
  charge: Record<string, unknown>,
  entete: Record<string, unknown> = { alg: 'RS256', kid: 'cle-1' },
) {
  const encoder = (valeur: unknown) =>
    Buffer.from(JSON.stringify(valeur)).toString('base64url');

  const corps = `${encoder(entete)}.${encoder(charge)}`;

  const signature = createSign('RSA-SHA256')
    .update(corps)
    .sign(privateKey)
    .toString('base64url');

  return `${corps}.${signature}`;
}

function chargeValide(surcharges: Record<string, unknown> = {}) {
  return {
    iss: EMETTEURS[0],
    aud: AUDIENCES[0],
    sub: 'google-123',
    email: 'lea@exemple.fr',
    email_verified: true,
    exp: Math.floor(Date.now() / 1000) + 600,
    ...surcharges,
  };
}

describe('verifierJeton', () => {
  it('accepte un jeton signe, non expire et bien adresse', () => {
    const contenu = verifierJeton(
      signer(chargeValide()),
      cle,
      EMETTEURS,
      AUDIENCES,
    );

    expect(contenu.sub).toBe('google-123');
  });

  it('accepte un destinataire parmi plusieurs', () => {
    const contenu = verifierJeton(
      signer(chargeValide({ aud: ['autre', AUDIENCES[0]] })),
      cle,
      EMETTEURS,
      AUDIENCES,
    );

    expect(contenu.sub).toBe('google-123');
  });

  it('refuse un jeton adresse a une autre application', () => {
    expect(() =>
      verifierJeton(
        signer(chargeValide({ aud: 'application-voisine' })),
        cle,
        EMETTEURS,
        AUDIENCES,
      ),
    ).toThrow('Destinataire inattendu');
  });

  it('refuse un emetteur inconnu', () => {
    expect(() =>
      verifierJeton(
        signer(chargeValide({ iss: 'https://exemple.test' })),
        cle,
        EMETTEURS,
        AUDIENCES,
      ),
    ).toThrow('Emetteur inattendu');
  });

  it('refuse un jeton expire', () => {
    expect(() =>
      verifierJeton(
        signer(chargeValide({ exp: Math.floor(Date.now() / 1000) - 10 })),
        cle,
        EMETTEURS,
        AUDIENCES,
      ),
    ).toThrow('Jeton expire');
  });

  it('refuse une charge modifiee apres signature', () => {
    const jeton = signer(chargeValide());
    const [entete, , signature] = jeton.split('.');

    const falsifiee = Buffer.from(
      JSON.stringify(chargeValide({ sub: 'quelqu-un-d-autre' })),
    ).toString('base64url');

    expect(() =>
      verifierJeton(
        `${entete}.${falsifiee}.${signature}`,
        cle,
        EMETTEURS,
        AUDIENCES,
      ),
    ).toThrow('Signature invalide');
  });

  it('refuse un algorithme que nous n attendons pas', () => {
    expect(() =>
      verifierJeton(
        signer(chargeValide(), { alg: 'none', kid: 'cle-1' }),
        cle,
        EMETTEURS,
        AUDIENCES,
      ),
    ).toThrow('Algorithme refuse');
  });
});
