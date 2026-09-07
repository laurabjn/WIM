export interface IdentityVerificationProviderPort {
  startVerification(params: { userId: string; email: string }): Promise<{
    redirectUrl: string;
    returnUrl: string;
    sessionId: string;
  }>;
}
