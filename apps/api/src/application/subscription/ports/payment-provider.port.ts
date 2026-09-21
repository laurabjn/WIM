export type PlanAbonnement = 'MONTHLY' | 'YEARLY';

export type Devise = 'EUR' | 'USD';

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

export type MoyenDePaiement = {
  id: string;
  type: string;
  libelle: string;
  detail: string;
  principal: boolean;
};

export interface PaymentProviderPort {
  tarifs(devise: Devise): Promise<TarifsParPlan>;

  ouvrirLePortail(externalId: string): Promise<string | null>;

  resilier(externalId: string): Promise<boolean>;

  offrirDesJours(externalId: string, jours: number): Promise<Date | null>;

  moyensDePaiement(externalId: string): Promise<MoyenDePaiement[]>;

  definirLeMoyenPrincipal(externalId: string, moyenId: string): Promise<boolean>;

  retirerLeMoyen(externalId: string, moyenId: string): Promise<boolean>;

  ajouterUnMoyen(externalId: string): Promise<string | null>;

  creerPaiement(params: {
    userId: string;
    email: string;
    plan: PlanAbonnement;
    devise: Devise;
    coupon?: string;
  }): Promise<{ url: string; externalId: string }>;

  appliquerUneRemise(externalId: string, coupon: string): Promise<boolean>;

  reconnait(externalId: string): boolean;

  effacerLeClient(externalId: string): Promise<boolean>;

  lireEvenement(corps: Buffer, signature: string): VerdictPaiement | null;
}
