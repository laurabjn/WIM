'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CircleCheck, CreditCard, Wallet } from 'lucide-react';

import { getSession } from 'app/auth/infrastructure/authStorage';
import {
  addPaymentMethod,
  cancelSubscription,
  fetchPaymentMethods,
  fetchSubscription,
  openBillingPortal,
  removePaymentMethod,
  setPrimaryPaymentMethod,
  startCheckout,
  type EtatAbonnement,
  type MoyenDePaiement,
  type PlanAbonnement,
} from 'app/subscription/infrastructure/subscription.api';

import styles from './Abonnement.module.css';

type Etat = 'chargement' | 'anonyme' | 'prete' | 'erreur';

const PLANS: PlanAbonnement[] = ['YEARLY'];

const LIBELLES: Record<PlanAbonnement, { nom: string; aide: string }> = {
  YEARLY: { nom: 'subscription.yearly', aide: 'subscription.yearlyHint' },
  MONTHLY: { nom: 'subscription.monthly', aide: 'subscription.monthlyHint' },
};

const AVANTAGES = [
  {
    titre: 'subscription.benefitsFindTitle',
    lignes: ['subscription.benefitsFind1', 'subscription.benefitsFind2'],
  },
  {
    titre: 'subscription.benefitsSafeTitle',
    lignes: ['subscription.benefitsSafe1', 'subscription.benefitsSafe2'],
  },
];

export function Abonnement() {
  const t = useTranslations();
  const locale = useLocale();
  const parametres = useSearchParams();

  const [etat, setEtat] = useState<Etat>('chargement');
  const [token, setToken] = useState<string | null>(null);
  const [abonnement, setAbonnement] = useState<EtatAbonnement | null>(null);
  const [moyens, setMoyens] = useState<MoyenDePaiement[]>([]);

  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmeResiliation, setConfirmeResiliation] = useState(false);
  const [avantagesOuverts, setAvantagesOuverts] = useState(true);

  const revenuDeStripe =
    parametres.get('abonnement') === 'ok' || parametres.get('moyen') === 'ok';

  const dates = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
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

    Promise.all([
      fetchSubscription(session.accessToken),
      fetchPaymentMethods(session.accessToken).catch(() => []),
    ])
      .then(([mien, cartes]) => {
        if (!actif) return;

        setAbonnement(mien);
        setMoyens(cartes);
        setEtat('prete');
      })
      .catch(() => {
        if (actif) setEtat('erreur');
      });

    return () => {
      actif = false;
    };
  }, []);

  async function partirVers(
    promesse: Promise<{ url: string; returnUrl?: string }>,
  ) {
    if (occupe) return;

    setOccupe(true);
    setErreur(null);

    try {
      const { url } = await promesse;

      window.location.href = url;
    } catch {
      setErreur(t('subscription.error'));
      setOccupe(false);
    }
  }

  async function resilier() {
    if (!token || occupe) return;

    setOccupe(true);
    setErreur(null);

    try {
      setAbonnement(await cancelSubscription(token));
      setConfirmeResiliation(false);
    } catch {
      setErreur(t('subscription.error'));
    } finally {
      setOccupe(false);
    }
  }

  async function agirSurLeMoyen(promesse: Promise<MoyenDePaiement[]>) {
    if (occupe) return;

    setOccupe(true);
    setErreur(null);

    try {
      setMoyens(await promesse);
    } catch {
      setErreur(t('subscription.error'));
    } finally {
      setOccupe(false);
    }
  }

  if (etat === 'chargement') {
    return <p className={styles.etat}>{t('common.loading')}</p>;
  }

  if (etat === 'anonyme') {
    return (
      <div className={styles.etat}>
        <p>{t('common.signInRequired')}</p>

        <Link href="/login" className={styles.boutonSombre}>
          {t('common.signIn')}
        </Link>
      </div>
    );
  }

  if (etat === 'erreur' || !abonnement) {
    return <p className={styles.etat}>{t('subscription.error')}</p>;
  }

  const principal = moyens.find((moyen) => moyen.principal);
  const autres = moyens.filter((moyen) => !moyen.principal);

  const tarif = abonnement.plan ? abonnement.tarifs[abonnement.plan] : null;

  function decrire(moyen: MoyenDePaiement) {
    return moyen.type === 'paypal'
      ? t('subscription.methodPaypal', {
          marque: moyen.libelle,
          compte: moyen.detail,
        })
      : t('subscription.methodCard', {
          marque: moyen.libelle,
          last4: moyen.detail,
        });
  }

  function carteDeMoyen(moyen: MoyenDePaiement) {
    const Icone = moyen.type === 'paypal' ? Wallet : CreditCard;

    return (
      <div key={moyen.id} className={styles.moyen}>
        <p className={styles.moyenLigne}>
          <Icone size={22} className={styles.moyenIcone} />
          {decrire(moyen)}
        </p>

        <p className={styles.moyenActions}>
          {moyen.principal ? null : (
            <button
              type="button"
              className={styles.lien}
              disabled={occupe || !token}
              onClick={() =>
                token && agirSurLeMoyen(setPrimaryPaymentMethod(token, moyen.id))
              }
            >
              {t('subscription.setPrimary')}
            </button>
          )}

          <button
            type="button"
            className={styles.lien}
            disabled={occupe || !token}
            onClick={() =>
              token && agirSurLeMoyen(removePaymentMethod(token, moyen.id))
            }
          >
            {t('subscription.remove')}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {revenuDeStripe ? (
        <p className={styles.succes}>{t('subscription.backFromPayment')}</p>
      ) : null}

      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

      <div className={styles.colonnes}>
        <div className={styles.colonne}>
          <h2 className={styles.sectionTitre}>{t('subscription.mine')}</h2>

          <div className={styles.carte}>
            <span
              className={
                abonnement.actif ? styles.badgeActif : styles.badgeInactif
              }
            >
              {abonnement.actif
                ? t('subscription.statusActive')
                : t('subscription.statusInactive')}
            </span>

            <p className={styles.plan}>{t('subscription.planName')}</p>

            <button
              type="button"
              className={styles.replier}
              aria-expanded={avantagesOuverts}
              onClick={() => setAvantagesOuverts((ouvert) => !ouvert)}
            >
              {avantagesOuverts ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}

              {t('subscription.benefits')}
            </button>

            {avantagesOuverts
              ? AVANTAGES.map((groupe) => (
                  <div key={groupe.titre} className={styles.groupe}>
                    <p className={styles.groupeTitre}>{t(groupe.titre)}</p>

                    <ul className={styles.avantages}>
                      {groupe.lignes.map((ligne) => (
                        <li key={ligne} className={styles.avantage}>
                          <CircleCheck
                            size={16}
                            className={styles.coche}
                            fill="currentColor"
                            stroke="var(--wim-surface)"
                          />
                          {t(ligne)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              : null}
          </div>

          {abonnement.accesLibreJusquAu ? (
            <>
              <h2 className={styles.sectionTitre}>
                {t('subscription.freeUntilLabel')}
              </h2>

              <dl className={styles.lignes}>
                <div className={styles.ligne}>
                  <dt>{t('subscription.paymentDate')}</dt>
                  <dd>{dates.format(new Date(abonnement.accesLibreJusquAu))}</dd>
                </div>
              </dl>
            </>
          ) : null}

          {abonnement.actif && (abonnement.finDePeriode || tarif) ? (
            <>
              <h2 className={styles.sectionTitre}>
                {abonnement.annuleLe
                  ? t('subscription.activeUntilLabel')
                  : t('subscription.nextPayment')}
              </h2>

              <dl className={styles.lignes}>
                {abonnement.finDePeriode ? (
                  <div className={styles.ligne}>
                    <dt>{t('subscription.paymentDate')}</dt>
                    <dd>{dates.format(new Date(abonnement.finDePeriode))}</dd>
                  </div>
                ) : null}

                {tarif ? (
                  <div className={styles.ligne}>
                    <dt>{t('subscription.price')}</dt>
                    <dd>{tarif.libelle}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : null}

          {abonnement.actif && !abonnement.facturable ? (
            <p className={styles.aide}>{t('subscription.offeredNoBilling')}</p>
          ) : null}

          {abonnement.actif ? null : (
            <p className={styles.aide}>{t('subscription.noSubscription')}</p>
          )}

          {abonnement.actif && abonnement.facturable ? null : (
            <div className={styles.formules}>
              {abonnement.venteDansLApp ? (
                PLANS.map((plan) => {
                  const formule = abonnement.tarifs[plan];

                  return (
                    <div key={plan} className={styles.formule}>
                      <p className={styles.formuleNom}>{t(LIBELLES[plan].nom)}</p>

                      <p className={styles.formulePrix}>
                        {formule?.libelle ?? '—'}
                      </p>

                      <p className={styles.formuleAide}>
                        {t(LIBELLES[plan].aide)}
                      </p>

                      <button
                        type="button"
                        className={styles.boutonSombre}
                        disabled={occupe || !token}
                        onClick={() =>
                          token && partirVers(startCheckout(token, plan))
                        }
                      >
                        {t('subscription.subscribe')}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className={styles.aide}>{t('subscription.saleOutsideApp')}</p>
              )}
            </div>
          )}

          {abonnement.facturable && !abonnement.annuleLe ? (
            confirmeResiliation ? (
              <div className={styles.confirmation}>
                <p className={styles.aide}>{t('subscription.cancelConfirm')}</p>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.boutonContour}
                    onClick={() => setConfirmeResiliation(false)}
                  >
                    {t('common.cancel')}
                  </button>

                  <button
                    type="button"
                    className={styles.boutonDanger}
                    disabled={occupe}
                    onClick={resilier}
                  >
                    {t('subscription.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={styles.boutonContour}
                onClick={() => setConfirmeResiliation(true)}
              >
                {t('subscription.cancelMine')}
              </button>
            )
          ) : null}
        </div>

        <div className={styles.colonne}>
          <h2 className={styles.sectionTitre}>
            {t('subscription.paymentMethods')}
          </h2>

          {principal ? (
            <>
              <p className={styles.etiquette}>{t('subscription.primary')}</p>

              {carteDeMoyen(principal)}
            </>
          ) : (
            <p className={styles.aide}>{t('subscription.noPaymentMethod')}</p>
          )}

          {autres.length > 0 ? (
            <>
              <p className={styles.etiquette}>
                {t('subscription.otherMethods')}
              </p>

              {autres.map(carteDeMoyen)}
            </>
          ) : null}

          <button
            type="button"
            className={styles.boutonContour}
            disabled={occupe || !token}
            onClick={() => token && partirVers(addPaymentMethod(token))}
          >
            {t('subscription.addMethod')}
          </button>

          {abonnement.facturable ? (
            <>
              <h2 className={styles.sectionTitre}>
                {t('subscription.manageValue')}
              </h2>

              <p className={styles.aide}>{t('subscription.manageHint')}</p>

              <button
                type="button"
                className={styles.boutonContour}
                disabled={occupe || !token}
                onClick={() => token && partirVers(openBillingPortal(token))}
              >
                {t('subscription.openPortal')}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
