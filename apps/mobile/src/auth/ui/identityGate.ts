import { fetchIdentityStatus } from '../infrastructure/identity.api';
import { IdentityStatus } from '../dtos/identityStatus';

export class IdentiteRequiseError extends Error {
  readonly code = 'IDENTITY_NOT_VERIFIED';
}

type Auditeur = (ouverte: boolean) => void;

let auditeur: Auditeur | null = null;

export function ecouterLaPorteIdentite(fn: Auditeur): () => void {
  auditeur = fn;

  return () => {
    if (auditeur === fn) auditeur = null;
  };
}

export function demanderLaVerificationIdentite(): void {
  auditeur?.(true);
}

export function signalerSiIdentiteRequise(status: number, corps: unknown): void {
  const reponse = corps as { code?: string; message?: string } | null;

  if (status !== 403 || reponse?.code !== 'IDENTITY_NOT_VERIFIED') return;

  demanderLaVerificationIdentite();

  throw new IdentiteRequiseError(reponse?.message ?? '');
}

export function estUneDemandeDIdentite(erreur: unknown): boolean {
  return erreur instanceof IdentiteRequiseError;
}

export async function ouvrirLaPorteSiNonVerifie(): Promise<void> {
  const statut = await fetchIdentityStatus().catch(() => null);

  if (statut !== null && statut !== IdentityStatus.VERIFIED) {
    demanderLaVerificationIdentite();
  }
}
