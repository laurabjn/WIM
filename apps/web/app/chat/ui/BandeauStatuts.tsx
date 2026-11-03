'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { MyChatListItem } from '@wim/shared';

import {
  getMyProfile,
  updateMyProfile,
} from 'app/profile/infrastructure/profile.api';
import styles from './BandeauStatuts.module.css';

const MAX_VISIBLES = 8;

type Props = {
  token: string;
  conversations: MyChatListItem[];
  onOuvrir: (chatId: string) => void;
};

export function BandeauStatuts({ token, conversations, onOuvrir }: Props) {
  const t = useTranslations('chat');

  const [monStatut, setMonStatut] = useState<string | null>(null);
  const [monAvatar, setMonAvatar] = useState<string | null>(null);
  const [editeurOuvert, setEditeurOuvert] = useState(false);
  const [brouillon, setBrouillon] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let actif = true;

    getMyProfile(token)
      .then((profil) => {
        if (!actif) return;

        setMonStatut(profil.status ?? null);
        setMonAvatar(profil.avatarUrl ?? null);
      })
      .catch(() => undefined);

    return () => {
      actif = false;
    };
  }, [token]);

  function ouvrirEditeur() {
    setBrouillon(monStatut ?? '');
    setErreur(false);
    setEditeurOuvert(true);
  }

  async function enregistrer(texte: string) {
    setEnregistrement(true);
    setErreur(false);

    try {
      const profil = await updateMyProfile(token, { statusText: texte || null });

      setMonStatut(profil.status ?? null);
      setEditeurOuvert(false);
    } catch {
      setErreur(true);
    } finally {
      setEnregistrement(false);
    }
  }

  const avecStatut = conversations
    .filter((conversation) => conversation.participant?.status)
    .slice(0, MAX_VISIBLES);

  return (
    <section className={styles.bandeau}>
      <div className={styles.rangee}>
        <button
          type="button"
          className={styles.item}
          onClick={ouvrirEditeur}
        >
          <span className={styles.bulle}>{monStatut ?? t('shareStatus')}</span>

          {monAvatar ? (
            <Image
              src={monAvatar}
              alt=""
              width={56}
              height={56}
              className={styles.avatar}
            />
          ) : (
            <span className={`${styles.avatar} ${styles.avatarVide}`} />
          )}
        </button>

        {avecStatut.map((conversation) => (
          <button
            key={`statut-${conversation.id}`}
            type="button"
            className={styles.item}
            onClick={() => onOuvrir(conversation.id)}
          >
            <span className={styles.bulle}>
              {conversation.participant?.status}
            </span>

            {conversation.participant?.avatarUrl ? (
              <Image
                src={conversation.participant.avatarUrl}
                alt={conversation.participant.firstName ?? ''}
                width={56}
                height={56}
                className={styles.avatar}
              />
            ) : (
              <span className={`${styles.avatar} ${styles.avatarVide}`} />
            )}
          </button>
        ))}
      </div>

      {editeurOuvert ? (
        <div className={styles.editeur}>
          <label className={styles.editeurTitre} htmlFor="statut">
            {t('statusTitle')}
          </label>

          <input
            id="statut"
            className={styles.champ}
            value={brouillon}
            maxLength={120}
            placeholder={t('statusPlaceholder')}
            onChange={(evenement) => setBrouillon(evenement.target.value)}
          />

          {erreur ? <p className={styles.erreur}>{t('statusError')}</p> : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.retirer}
              disabled={enregistrement || !monStatut}
              onClick={() => enregistrer('')}
            >
              {t('statusClear')}
            </button>

            <button
              type="button"
              className={styles.publier}
              disabled={enregistrement || brouillon.trim().length === 0}
              onClick={() => enregistrer(brouillon.trim())}
            >
              {t('statusSave')}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
