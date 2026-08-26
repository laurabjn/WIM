import { API_URL } from 'src/config/api';
import { getSession } from 'src/auth/infrastructure/authStorage';

export type PlanAbonnement = 'MONTHLY' | 'YEARLY';

export type EtatAbonnement = {
  actif: boolean;
  plan: PlanAbonnement | null;
  statut: string;
  finDePeriode: string | null;
  annuleLe: string | null;
};

export type EtatParrainage = {
  code: string;
  filleuls: number;
  recompenses: number;
  parraine: boolean;
};

async function appeler<T>(
  chemin: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}${chemin}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Requête refusée');
  }

  return data as T;
}

export function fetchSubscriptionApi(): Promise<EtatAbonnement> {
  return appeler('/subscriptions/me');
}

export function startCheckoutApi(plan: PlanAbonnement): Promise<{ url: string }> {
  return appeler('/subscriptions/checkout', { method: 'POST', body: { plan } });
}

export function cancelSubscriptionApi(): Promise<EtatAbonnement> {
  return appeler('/subscriptions/cancel', { method: 'POST' });
}

// Sans prestataire de paiement, l'API expose un retour de caisse simule : il
// permet d'eprouver le parcours complet avant qu'un prestataire soit choisi.
export function simulatePaymentApi(): Promise<EtatAbonnement> {
  return appeler('/subscriptions/simulate', { method: 'POST' });
}

export function fetchReferralApi(): Promise<EtatParrainage> {
  return appeler('/subscriptions/referral');
}

export function applyReferralApi(code: string): Promise<EtatParrainage> {
  return appeler('/subscriptions/referral', { method: 'POST', body: { code } });
}
