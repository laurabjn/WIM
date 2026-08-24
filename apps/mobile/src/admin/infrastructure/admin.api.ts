import { API_URL } from 'src/config/api';

export type ReportedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  suspendedAt?: string | null;
};

export type ModerationReport = {
  id: string;
  reason: string;
  message: string | null;
  createdAt: string;
  handledAt: string | null;
  reporter: ReportedUser;
  reported: ReportedUser;
};

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export type AdminStats = {
  signalementsEnAttente: number;
  comptesSuspendus: number;
  utilisateurs: number;
  nouveauxUtilisateurs: number;
  logements: number;
  echangesEnCours: number;
  echangesEnAttente: number;
  messages: number;
};

export async function getAdminStatsApi(token: string): Promise<AdminStats> {
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: authHeaders(token),
  });

  if (!response.ok) throw new Error('Le chargement des chiffres a échoué');

  return response.json();
}

export async function runReviewRemindersApi(
  token: string,
): Promise<{ commences: number; termines: number; envoyes: number }> {
  const response = await fetch(`${API_URL}/admin/review-reminders/run`, {
    method: 'POST',
    headers: authHeaders(token),
  });

  if (!response.ok) throw new Error('Les rappels n’ont pas pu être envoyés');

  return response.json();
}

export async function getReportsApi(
  token: string,
  seulementEnAttente = false,
): Promise<ModerationReport[]> {
  const response = await fetch(
    `${API_URL}/admin/reports${seulementEnAttente ? '?pending=true' : ''}`,
    { headers: authHeaders(token) },
  );

  if (!response.ok) throw new Error('Le chargement des signalements a échoué');

  return response.json();
}

export async function markReportHandledApi(
  token: string,
  reportId: string,
  handled: boolean,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/admin/reports/${reportId}/handled`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ handled }),
    },
  );

  if (!response.ok) throw new Error('La mise à jour a échoué');
}

export async function setUserSuspensionApi(
  token: string,
  userId: string,
  suspended: boolean,
): Promise<void> {
  const response = await fetch(`${API_URL}/admin/users/${userId}/suspension`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ suspended }),
  });

  if (!response.ok) throw new Error('La suspension a échoué');
}
