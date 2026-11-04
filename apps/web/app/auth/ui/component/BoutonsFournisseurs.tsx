'use client';

import Image from 'next/image';
import React, { useState } from 'react';

import { socialSignInApi } from 'app/auth/infrastructure/authApi';
import {
  appleEstConfigure,
  googleEstConfigure,
  jetonApple,
  jetonGoogle,
} from 'app/auth/infrastructure/connexionSociale';

import styles from './BoutonsFournisseurs.module.css';

type Fournisseur = 'GOOGLE' | 'APPLE';

type Props = {
  libelleGoogle: string;
  libelleApple: string;
  onConnecte: () => void;
};

export const BoutonsFournisseurs: React.FC<Props> = ({
  libelleGoogle,
  libelleApple,
  onConnecte,
}) => {
  const [enCours, setEnCours] = useState<Fournisseur | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function connecter(fournisseur: Fournisseur) {
    setErreur(null);
    setEnCours(fournisseur);

    try {
      const idToken =
        fournisseur === 'GOOGLE' ? await jetonGoogle() : await jetonApple();

      if (!idToken) return;

      await socialSignInApi({ provider: fournisseur, idToken });
      onConnecte();
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setEnCours(null);
    }
  }

  return (
    <>
      {googleEstConfigure ? (
        <button
          type="button"
          className={styles.bouton}
          onClick={() => connecter('GOOGLE')}
          disabled={enCours !== null}
        >
          <Image
            src="/google.svg"
            alt=""
            width={20}
            height={20}
            className={styles.marque}
          />
          {libelleGoogle}
        </button>
      ) : null}

      {appleEstConfigure ? (
        <button
          type="button"
          className={styles.bouton}
          onClick={() => connecter('APPLE')}
          disabled={enCours !== null}
        >
          <Image
            src="/apple.svg"
            alt=""
            width={20}
            height={20}
            className={styles.marque}
          />
          {libelleApple}
        </button>
      ) : null}

      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}
    </>
  );
};
