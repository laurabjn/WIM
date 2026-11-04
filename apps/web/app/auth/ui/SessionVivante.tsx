'use client';

import { useEffect } from 'react';
import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  bientotExpire,
  rafraichirLaSession,
} from 'app/auth/infrastructure/sessionVivante';

const INTERVALLE = 60_000;

export function SessionVivante() {
  useEffect(() => {
    let actif = true;

    async function verifier() {
      if (!actif) return;

      const session = getSession();

      if (!session || !bientotExpire(session.accessToken)) return;

      await rafraichirLaSession();
    }

    verifier();

    const minuteur = setInterval(verifier, INTERVALLE);
    const auRetour = () => void verifier();

    window.addEventListener('focus', auRetour);

    return () => {
      actif = false;
      clearInterval(minuteur);
      window.removeEventListener('focus', auRetour);
    };
  }, []);

  return null;
}
