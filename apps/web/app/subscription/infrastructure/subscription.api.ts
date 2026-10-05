import { API_URL } from 'app/home/infrastructure/api';

export type PlanAbonnement = 'MONTHLY' | 'YEARLY';

export type TarifAffiche = {
  montant: number;
  devise: string;
  libelle: string;
};

export type EtatAbonnement = {
  actif: boolean;
  accesLibreJusquAu: string | null;
  etudiant: boolean;
  facturable: boolean;
  plan: PlanAbonnement | null;
  statut: string;
  finDePeriode: string | null;
  annuleLe: string | null;
  tarifs: Record<PlanAbonnement, TarifAffiche | null>;
  venteDansLApp: boolean;
};

export type MoyenDePaiement = {
  id: string;
  type: string;
  libelle: string;
  detail: string;
  principal: boolean;
};

export type EtatParrainage = {
  code: string;
  filleuls: number;
  recompenses: number;
  parraine: boolean;
  joursOfferts: number;
};

export type EtatEtudiant = {
  etudiant: boolean;
  jusquAu: string | null;
  email: string | null;
  codeEnvoye: boolean;
};

async function appeler<T>(
  token: string,
  chemin: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${chemin}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Platform': 'web',
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message;

    throw new Error(message ?? 'Requête refusée');
  }

  return data as T;
}

export function fetchSubscription(token: string): Promise<EtatAbonnement> {
  return appeler(token, '/subscriptions/me');
}

export function startCheckout(
  token: string,
  plan: PlanAbonnement,
): Promise<{ url: string; returnUrl?: string }> {
  return appeler(token, '/subscriptions/checkout', {
    method: 'POST',
    body: { plan },
  });
}

export function openBillingPortal(
  token: string,
): Promise<{ url: string; returnUrl?: string }> {
  return appeler(token, '/subscriptions/portal', { method: 'POST' });
}

export function cancelSubscription(token: string): Promise<EtatAbonnement> {
  return appeler(token, '/subscriptions/cancel', { method: 'POST' });
}

export function fetchPaymentMethods(
  token: string,
): Promise<MoyenDePaiement[]> {
  return appeler(token, '/subscriptions/payment-methods');
}

export function setPrimaryPaymentMethod(
  token: string,
  id: string,
): Promise<MoyenDePaiement[]> {
  return appeler(token, '/subscriptions/payment-methods/default', {
    method: 'POST',
    body: { id },
  });
}

export function removePaymentMethod(
  token: string,
  id: string,
): Promise<MoyenDePaiement[]> {
  return appeler(
    token,
    `/subscriptions/payment-methods/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
}

export function addPaymentMethod(
  token: string,
): Promise<{ url: string; returnUrl?: string }> {
  return appeler(token, '/subscriptions/payment-methods/setup', {
    method: 'POST',
  });
}

export function fetchReferral(token: string): Promise<EtatParrainage> {
  return appeler(token, '/subscriptions/referral');
}

export function applyReferral(
  token: string,
  code: string,
): Promise<EtatParrainage> {
  return appeler(token, '/subscriptions/referral', {
    method: 'POST',
    body: { code },
  });
}

export function fetchStudent(token: string): Promise<EtatEtudiant> {
  return appeler(token, '/students/me');
}

export function sendStudentCode(
  token: string,
  email: string,
): Promise<EtatEtudiant> {
  return appeler(token, '/students/code', { method: 'POST', body: { email } });
}

export function confirmStudentCode(
  token: string,
  code: string,
): Promise<EtatEtudiant> {
  return appeler(token, '/students/confirm', {
    method: 'POST',
    body: { code },
  });
}
