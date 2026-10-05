'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  ChatMessages,
  ChatUpdatedSocketPayload,
  MessageCreatedSocketPayload,
  MessageSender,
  MessagesReadSocketPayload,
  MyChatListItem,
} from '@wim/shared';

import { getSession } from 'app/auth/infrastructure/authStorage';
import { BandeauEchange } from 'app/exchange/ui/BandeauEchange';
import {
  getChatMessages,
  getMyChats,
  markChatAsRead,
  normaliserMessage,
  sendMessage,
} from 'app/chat/infrastructure/chat.api';
import {
  connectChatSocket,
  disconnectChatSocket,
} from 'app/chat/infrastructure/chatSocket';

import styles from './Messagerie.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

type Groupe = {
  cle: string;
  etiquette: string;
  messages: ChatMessages[];
};

function nomComplet(personne: MessageSender) {
  return [personne.firstName, personne.lastName].filter(Boolean).join(' ');
}

function initiales(personne: MessageSender) {
  const prenom = personne.firstName?.[0] ?? '';
  const nom = personne.lastName?.[0] ?? '';

  return (prenom + nom).toUpperCase() || '?';
}

function parRecence(liste: MyChatListItem[]) {
  return [...liste].sort((premiere, seconde) =>
    seconde.updatedAt.localeCompare(premiere.updatedAt),
  );
}

export function Messagerie() {
  const t = useTranslations();
  const locale = useLocale();
  const parametres = useSearchParams();
  const demande = parametres.get('chat');

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [moi, setMoi] = useState<string | null>(null);
  const [conversations, setConversations] = useState<MyChatListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessages[]>([]);
  const [curseur, setCurseur] = useState<string | null>(null);
  const [encore, setEncore] = useState(false);
  const [luLe, setLuLe] = useState<string | null>(null);
  const [chargementMessages, setChargementMessages] = useState(false);
  const [erreurMessages, setErreurMessages] = useState(false);

  const [brouillon, setBrouillon] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState(false);

  const fil = useRef<HTMLDivElement>(null);
  const lien = useRef<Socket | null>(null);

  const heure = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }),
    [locale],
  );

  const jour = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [locale],
  );

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setEtat('anonyme');

      return;
    }

    let actif = true;

    setToken(session.accessToken);
    setMoi(session.user.id);

    getMyChats(session.accessToken)
      .then((liste) => {
        if (!actif) return;

        const triees = parRecence(liste);

        setConversations(triees);
        setEtat('prete');

        const large =
          typeof window !== 'undefined' &&
          window.matchMedia('(min-width: 900px)').matches;

        const demandee = triees.find(
          (conversation) => conversation.id === demande,
        );

        if (demandee) {
          setActiveId(demandee.id);

          return;
        }

        const premiere = triees[0];

        if (large && premiere) setActiveId(premiere.id);
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    const socket = connectChatSocket(session.accessToken);

    lien.current = socket;

    const surConversation = (charge: ChatUpdatedSocketPayload) => {
      const message = normaliserMessage(charge.lastMessage);

      setConversations((liste) =>
        parRecence(
          liste.map((conversation) =>
            conversation.id === charge.chatId
              ? {
                  ...conversation,
                  lastMessage: message,
                  updatedAt: message.createdAt,
                  unreadCount: charge.unreadCount ?? conversation.unreadCount,
                }
              : conversation,
          ),
        ),
      );
    };

    socket.on('chat:updated', surConversation);

    return () => {
      actif = false;
      socket.off('chat:updated', surConversation);
      lien.current = null;
      disconnectChatSocket();
    };
  }, [demande]);

  useEffect(() => {
    if (!token || !activeId) return;

    let actif = true;

    setMessages([]);
    setCurseur(null);
    setEncore(false);
    setLuLe(null);
    setErreurMessages(false);
    setErreurEnvoi(false);
    setChargementMessages(true);

    getChatMessages(token, activeId)
      .then((page) => {
        if (!actif) return;

        setMessages([...page.messages].reverse());
        setCurseur(page.nextCursor);
        setEncore(page.hasMore);
        setLuLe(page.participantLastReadAt);
      })
      .catch(() => {
        if (actif) setErreurMessages(true);
      })
      .finally(() => {
        if (actif) setChargementMessages(false);
      });

    markChatAsRead(token, activeId)
      .then(() => {
        if (!actif) return;

        setConversations((liste) =>
          liste.map((conversation) =>
            conversation.id === activeId
              ? { ...conversation, unreadCount: 0 }
              : conversation,
          ),
        );
      })
      .catch(() => undefined);

    return () => {
      actif = false;
    };
  }, [token, activeId]);

  useEffect(() => {
    const socket = lien.current;

    if (!socket || !token || !activeId) return;

    socket.emit('chat:join', { chatId: activeId });

    const surMessage = (charge: MessageCreatedSocketPayload) => {
      if (charge.chatId !== activeId) return;

      const message = normaliserMessage(charge.message);

      setMessages((courant) =>
        courant.some((existant) => existant.id === message.id)
          ? courant
          : [...courant, message],
      );

      if (message.senderId === moi) return;

      markChatAsRead(token, activeId)
        .then(() =>
          setConversations((liste) =>
            liste.map((conversation) =>
              conversation.id === activeId
                ? { ...conversation, unreadCount: 0 }
                : conversation,
            ),
          ),
        )
        .catch(() => undefined);
    };

    const surModification = (charge: MessageCreatedSocketPayload) => {
      if (charge.chatId !== activeId) return;

      const message = normaliserMessage(charge.message);

      setMessages((courant) =>
        courant.map((existant) =>
          existant.id === message.id ? message : existant,
        ),
      );
    };

    const surSuppression = (charge: {
      chatId: string;
      messageId: string;
    }) => {
      if (charge.chatId !== activeId) return;

      setMessages((courant) =>
        courant.filter((existant) => existant.id !== charge.messageId),
      );
    };

    const surLecture = (charge: MessagesReadSocketPayload) => {
      if (charge.chatId !== activeId || charge.userId === moi) return;

      setLuLe(charge.readAt);
    };

    socket.on('message:created', surMessage);
    socket.on('message:updated', surModification);
    socket.on('message:deleted', surSuppression);
    socket.on('messages:read', surLecture);

    return () => {
      socket.off('message:created', surMessage);
      socket.off('message:updated', surModification);
      socket.off('message:deleted', surSuppression);
      socket.off('messages:read', surLecture);
      socket.emit('chat:leave', { chatId: activeId });
    };
  }, [token, activeId, moi]);

  const dernierId = messages[messages.length - 1]?.id ?? null;

  useEffect(() => {
    const noeud = fil.current;

    if (noeud) noeud.scrollTop = noeud.scrollHeight;
  }, [dernierId]);

  async function chargerPrecedents() {
    if (!token || !activeId || !curseur || chargementMessages) return;

    setChargementMessages(true);

    try {
      const page = await getChatMessages(token, activeId, curseur);

      setMessages((courant) => [...[...page.messages].reverse(), ...courant]);
      setCurseur(page.nextCursor);
      setEncore(page.hasMore);
    } catch {
      setErreurMessages(true);
    } finally {
      setChargementMessages(false);
    }
  }

  async function envoyer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();

    const contenu = brouillon.trim();

    if (!token || !activeId || !contenu || envoi) return;

    setEnvoi(true);
    setErreurEnvoi(false);

    try {
      const message = await sendMessage(token, activeId, contenu);

      setMessages((courant) => [...courant, message]);
      setBrouillon('');
      setConversations((liste) =>
        parRecence(
          liste.map((conversation) =>
            conversation.id === activeId
              ? {
                  ...conversation,
                  lastMessage: message,
                  updatedAt: message.createdAt,
                }
              : conversation,
          ),
        ),
      );
    } catch {
      setErreurEnvoi(true);
    } finally {
      setEnvoi(false);
    }
  }

  function etiquetteDeJour(date: string) {
    const quand = new Date(date);
    const aujourdhui = new Date();
    const hier = new Date();

    hier.setDate(hier.getDate() - 1);

    if (quand.toDateString() === aujourdhui.toDateString())
      return t('chat.today');

    if (quand.toDateString() === hier.toDateString()) return t('chat.yesterday');

    return jour.format(quand);
  }

  function apercu(message: ChatMessages | null) {
    if (!message) return t('chat.startConversation');
    if (message.type === 'IMAGE') return t('chat.photoPreview');
    if (message.type === 'AUDIO') return t('chat.voicePreview');

    return message.content;
  }

  function grouper(liste: ChatMessages[]) {
    const groupes: Groupe[] = [];

    for (const message of liste) {
      const cle = new Date(message.createdAt).toDateString();
      const dernier = groupes[groupes.length - 1];

      if (dernier && dernier.cle === cle) {
        dernier.messages.push(message);

        continue;
      }

      groupes.push({
        cle,
        etiquette: etiquetteDeJour(message.createdAt),
        messages: [message],
      });
    }

    return groupes;
  }

  if (etat === 'chargement') {
    return <p className={styles.etat}>{t('common.loading')}</p>;
  }

  if (etat === 'anonyme') {
    return (
      <div className={styles.etat}>
        <p>{t('common.signInRequired')}</p>

        <Link href="/login" className={styles.lien}>
          {t('common.signIn')}
        </Link>
      </div>
    );
  }

  if (etat === 'erreur') {
    return <p className={styles.etat}>{t('chat.loadError')}</p>;
  }

  const active = conversations.find(
    (conversation) => conversation.id === activeId,
  );

  const monDernier = [...messages]
    .reverse()
    .find((message) => message.senderId === moi);

  const vu =
    monDernier && luLe
      ? new Date(luLe).getTime() >= new Date(monDernier.createdAt).getTime()
      : false;

  return (
    <div
      className={`${styles.messagerie} ${active ? styles.ouverte : ''}`.trim()}
    >
      <aside className={styles.liste}>
        {conversations.length === 0 ? (
          <div className={styles.vide}>
            <p className={styles.videTitre}>{t('chat.empty')}</p>
            <p className={styles.videTexte}>{t('chat.emptyDescription')}</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              className={`${styles.entree} ${
                conversation.id === activeId ? styles.entreeActive : ''
              }`.trim()}
              onClick={() => setActiveId(conversation.id)}
            >
              <span className={styles.avatar}>
                {conversation.participant.avatarUrl ? (
                  <Image
                    src={conversation.participant.avatarUrl}
                    alt={nomComplet(conversation.participant)}
                    fill
                    className={styles.avatarImage}
                  />
                ) : (
                  initiales(conversation.participant)
                )}
              </span>

              <span className={styles.entreeTextes}>
                <span className={styles.entreeNom}>
                  {nomComplet(conversation.participant)}
                </span>

                <span className={styles.entreeApercu}>
                  {apercu(conversation.lastMessage)}
                </span>
              </span>

              {conversation.unreadCount > 0 ? (
                <span className={styles.pastille}>
                  {conversation.unreadCount}
                </span>
              ) : null}
            </button>
          ))
        )}
      </aside>

      <section className={styles.discussion}>
        {!active ? (
          <p className={styles.attente}>{t('chat.empty')}</p>
        ) : (
          <>
            <header className={styles.entete}>
              <button
                type="button"
                className={styles.retour}
                onClick={() => setActiveId(null)}
                aria-label={t('chat.tabMessages')}
              >
                <ArrowLeft size={18} strokeWidth={2.2} />
              </button>

              <Link
                href={`/profile?userId=${active.participant.id}`}
                className={styles.enteteProfil}
              >
                <span className={styles.avatar}>
                  {active.participant.avatarUrl ? (
                    <Image
                      src={active.participant.avatarUrl}
                      alt={nomComplet(active.participant)}
                      fill
                      className={styles.avatarImage}
                    />
                  ) : (
                    initiales(active.participant)
                  )}
                </span>

                <span className={styles.enteteNom}>
                  {nomComplet(active.participant)}
                </span>
              </Link>
            </header>

            {token ? (
              <BandeauEchange token={token} chatId={active.id} />
            ) : null}

            <div className={styles.fil} ref={fil}>
              {encore ? (
                <button
                  type="button"
                  className={styles.plus}
                  onClick={chargerPrecedents}
                  disabled={chargementMessages}
                >
                  {chargementMessages
                    ? t('chat.loadingMore')
                    : t('common.seeMore')}
                </button>
              ) : null}

              {erreurMessages ? (
                <p className={styles.erreur}>{t('chat.loadError')}</p>
              ) : null}

              {messages.length === 0 && !chargementMessages ? (
                <div className={styles.vide}>
                  <p className={styles.videTitre}>{t('chat.noMessages')}</p>
                  <p className={styles.videTexte}>
                    {t('chat.startConversation')}
                  </p>
                </div>
              ) : null}

              {grouper(messages).map((groupe) => (
                <div key={groupe.cle} className={styles.journee}>
                  <p className={styles.jourEtiquette}>{groupe.etiquette}</p>

                  {groupe.messages.map((message) => {
                    const demoi = message.senderId === moi;

                    return (
                      <div
                        key={message.id}
                        className={`${styles.ligne} ${
                          demoi ? styles.ligneMoi : ''
                        }`.trim()}
                      >
                        <div
                          className={`${styles.bulle} ${
                            demoi ? styles.bulleMoi : ''
                          }`.trim()}
                        >
                          {message.type === 'IMAGE' && message.attachmentUrl ? (
                            <span className={styles.photo}>
                              <Image
                                src={message.attachmentUrl}
                                alt={t('chat.photoPreview')}
                                fill
                                className={styles.photoImage}
                              />
                            </span>
                          ) : null}

                          {message.type === 'AUDIO' && message.attachmentUrl ? (
                            <audio
                              className={styles.audio}
                              controls
                              src={message.attachmentUrl}
                            />
                          ) : null}

                          {message.content ? (
                            <p className={styles.texte}>
                              {message.translatedContent ?? message.content}
                            </p>
                          ) : null}

                          <span className={styles.meta}>
                            {heure.format(new Date(message.createdAt))}

                            {message.editedAt ? ` · ${t('chat.edited')}` : ''}

                            {demoi && message.id === monDernier?.id
                              ? ` · ${vu ? t('chat.seen') : t('chat.delivered')}`
                              : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <form className={styles.composeur} onSubmit={envoyer}>
              <input
                className={styles.champ}
                type="text"
                value={brouillon}
                maxLength={2000}
                placeholder={t('chat.messagePlaceholder')}
                onChange={(evenement) => setBrouillon(evenement.target.value)}
              />

              <button
                type="submit"
                className={styles.envoyer}
                disabled={envoi || brouillon.trim().length === 0}
              >
                {t('chat.send')}
              </button>
            </form>

            {erreurEnvoi ? (
              <p className={styles.erreur}>{t('chat.sendError')}</p>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
