export interface IdentityVerificationProviderPort {
  startVerification(params: { userId: string; email: string }): Promise<{
    redirectUrl: string;
    sessionId: string;
  }>;
}
