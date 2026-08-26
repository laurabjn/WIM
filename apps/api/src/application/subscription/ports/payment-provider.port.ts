export type PlanAbonnement = 'MONTHLY' | 'YEARLY';

export type VerdictPaiement = {
  externalId: string;
  statut: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  finDePeriode: Date | null;
};

export interface PaymentProviderPort {
  creerPaiement(params: {
    userId: string;
    email: string;
    plan: PlanAbonnement;
  }): Promise<{ url: string; externalId: string }>;

  lireEvenement(corps: Buffer, signature: string): VerdictPaiement | null;
}
