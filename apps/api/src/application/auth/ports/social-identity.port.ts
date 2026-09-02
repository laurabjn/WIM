export type IdentiteExterne = {
  providerId: string;
  email: string | null;
  emailVerifie: boolean;
  firstName: string | null;
  lastName: string | null;
};

export interface SocialIdentityPort {
  verifier(
    fournisseur: 'GOOGLE' | 'APPLE',
    jeton: string,
  ): Promise<IdentiteExterne>;
}
