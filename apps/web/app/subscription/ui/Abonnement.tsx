'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

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

const PLANS: PlanAbonnement[] = ['YEARLY', 'MONTHLY'];

const LIBELLES: Record<PlanAbonnement, { nom: string; aide: string }> = {
  YEARLY: { nom: 'subscription.yearly', aide: 'subscription.yearlyHint' },
  MONTHLY: { nom: 'subscription.monthly', aide: 'subscription.monthlyHint' },
};

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

  const revenuDeStripe =
    parametres.get('abonnement') === 'ok' || parametres.get('moyen') === 'ok';

  const dates = useMemo(
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

  return (
    <div className={styles.page}>
      <p className={styles.chapeau}>{t('subscription.subtitle')}</p>

      {revenuDeStripe ? (
        <p className={styles.succes}>{t('subscription.backFromPayment')}</p>
      ) : null}

      {erreur ? <p className={styles.erreur}>{erreur}</p> : null}

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>{t('subscription.mine')}</h2>

        <div className={styles.ligne}>
          <span>{t('subscription.planName')}</span>

          <span className={styles.valeur}>
            {abonnement.actif
              ? t('subscription.statusActive')
              : t('subscription.statusInactive')}
          </span>
        </div>

        {abonnement.accesLibreJusquAu ? (
          <div className={styles.ligne}>
            <span>{t('subscription.freeUntilLabel')}</span>

            <span className={styles.valeur}>
              {dates.format(new Date(abonnement.accesLibreJusquAu))}
            </span>
          </div>
        ) : null}

        {abonnement.finDePeriode ? (
          <div className={styles.ligne}>
            <span>
              {abonnement.annuleLe
                ? t('subscription.activeUntilLabel')
                : t('subscription.nextPayment')}
            </span>

            <span className={styles.valeur}>
              {dates.format(new Date(abonnement.finDePeriode))}
            </span>
          </div>
        ) : null}

        {abonnement.plan && abonnement.tarifs[abonnement.plan] ? (
          <div className={styles.ligne}>
            <span>{t('subscription.price')}</span>

            <span className={styles.valeur}>
              {abonnement.tarifs[abonnement.plan]?.libelle}
            </span>
          </div>
        ) : null}

        {abonnement.actif && !abonnement.facturable ? (
          <p className={styles.aide}>{t('subscription.offeredNoBilling')}</p>
        ) : null}

        {abonnement.actif ? null : (
          <p className={styles.aide}>{t('subscription.noSubscription')}</p>
        )}
      </section>

      {abonnement.actif && abonnement.facturable ? null : (
        <section className={styles.bloc}>
          <h2 className={styles.blocTitre}>{t('subscription.benefits')}</h2>

          <ul className={styles.avantages}>
            <li>{t('subscription.benefitsFind1')}</li>
            <li>{t('subscription.benefitsFind2')}</li>
            <li>{t('subscription.benefitsSafe1')}</li>
            <li>{t('subscription.benefitsSafe2')}</li>
          </ul>

          {abonnement.venteDansLApp ? (
            <div className={styles.formules}>
              {PLANS.map((plan) => {
                const tarif = abonnement.tarifs[plan];

                return (
                  <div key={plan} className={styles.formule}>
                    <p className={styles.formuleNom}>
                      {t(LIBELLES[plan].nom)}
                    </p>

                    <p className={styles.formulePrix}>
                      {tarif?.libelle ?? '—'}
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
              })}
            </div>
          ) : (
            <p className={styles.aide}>{t('subscription.saleOutsideApp')}</p>
          )}
        </section>
      )}

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>
          {t('subscription.paymentMethods')}
        </h2>

        {principal ? (
          <div className={styles.ligne}>
            <span>
              {principal.libelle} · {principal.detail}
            </span>

            <span className={styles.badge}>{t('subscription.primary')}</span>
          </div>
        ) : (
          <p className={styles.aide}>{t('subscription.noPaymentMethod')}</p>
        )}

        {autres.length > 0 ? (
          <div className={styles.sousBloc}>
            <p className={styles.sousTitre}>
              {t('subscription.otherMethods')}
            </p>

            {autres.map((moyen) => (
              <div key={moyen.id} className={styles.ligne}>
                <span>
                  {moyen.libelle} · {moyen.detail}
                </span>

                <span className={styles.actions}>
                  <button
                    type="button"
                    className={styles.boutonClair}
                    disabled={occupe || !token}
                    onClick={() =>
                      token &&
                      agirSurLeMoyen(setPrimaryPaymentMethod(token, moyen.id))
                    }
                  >
                    {t('subscription.setPrimary')}
                  </button>

                  <button
                    type="button"
                    className={styles.boutonDanger}
                    disabled={occupe || !token}
                    onClick={() =>
                      token &&
                      agirSurLeMoyen(removePaymentMethod(token, moyen.id))
                    }
                  >
                    {t('subscription.remove')}
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          className={styles.boutonClair}
          disabled={occupe || !token}
          onClick={() => token && partirVers(addPaymentMethod(token))}
        >
          {t('subscription.addMethod')}
        </button>
      </section>

      {abonnement.facturable ? (
        <section className={styles.bloc}>
          <h2 className={styles.blocTitre}>
            {t('subscription.manageValue')}
          </h2>

          <p className={styles.aide}>{t('subscription.manageHint')}</p>

          <button
            type="button"
            className={styles.boutonClair}
            disabled={occupe || !token}
            onClick={() => token && partirVers(openBillingPortal(token))}
          >
            {t('subscription.openPortal')}
          </button>

          {abonnement.annuleLe ? null : confirmeResiliation ? (
            <div className={styles.sousBloc}>
              <p className={styles.aide}>{t('subscription.cancelConfirm')}</p>

              <span className={styles.actions}>
                <button
                  type="button"
                  className={styles.boutonClair}
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
              </span>
            </div>
          ) : (
            <button
              type="button"
              className={styles.boutonDanger}
              onClick={() => setConfirmeResiliation(true)}
            >
              {t('subscription.cancelMine')}
            </button>
          )}
        </section>
      ) : null}
    </div>
  );
}
