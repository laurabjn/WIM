export type PlanAbonnement = 'MONTHLY' | 'YEARLY';

export type VerdictPaiement = {
  externalId: string;
  nouvelExternalId?: string;
  statut: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  finDePeriode: Date | null;
};

export type TarifAffiche = {
  montant: number;
  devise: string;
  libelle: string;
};

export type TarifsParPlan = Record<PlanAbonnement, TarifAffiche | null>;

export interface PaymentProviderPort {
  tarifs(): Promise<TarifsParPlan>;

  ouvrirLePortail(externalId: string): Promise<string | null>;

  resilier(externalId: string): Promise<boolean>;

  creerPaiement(params: {
    userId: string;
    email: string;
    plan: PlanAbonnement;
  }): Promise<{ url: string; externalId: string }>;

  lireEvenement(corps: Buffer, signature: string): VerdictPaiement | null;
}
