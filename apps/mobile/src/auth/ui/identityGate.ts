import { fetchIdentityStatus } from '../infrastructure/identity.api';
import { IdentityStatus } from '../dtos/identityStatus';

export class IdentiteRequiseError extends Error {
  readonly code = 'IDENTITY_NOT_VERIFIED';
}

type Auditeur = (ouverte: boolean) => void;

type Options = { surAbandon?: () => void };

let auditeur: Auditeur | null = null;
let surAbandon: (() => void) | null = null;

export function ecouterLaPorteIdentite(fn: Auditeur): () => void {
  auditeur = fn;

  return () => {
    if (auditeur === fn) auditeur = null;
  };
}

export function demanderLaVerificationIdentite(options: Options = {}): void {
  surAbandon = options.surAbandon ?? null;
  auditeur?.(true);
}

export function fermerLaPorteIdentite(abandonnee: boolean): void {
  const abandon = surAbandon;

  surAbandon = null;
  auditeur?.(false);

  if (abandonnee) abandon?.();
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

export async function ouvrirLaPorteSiNonVerifie(
  options: Options = {},
): Promise<void> {
  const statut = await fetchIdentityStatus().catch(() => null);

  if (statut !== null && statut !== IdentityStatus.VERIFIED) {
    demanderLaVerificationIdentite(options);
  }
}
