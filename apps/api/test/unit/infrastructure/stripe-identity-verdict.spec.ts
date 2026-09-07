import { verdictApresEchec } from 'src/infrastructure/identity/stripe-identity.provider';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';

describe('verdictApresEchec', () => {
  it('laisse recommencer apres un document illisible', () => {
    expect(verdictApresEchec('document_unverified_other')).toBe(
      IdentityStatus.NOT_VERIFIED,
    );
  });

  it('laisse recommencer quand Stripe ne donne aucune raison', () => {
    expect(verdictApresEchec(null)).toBe(IdentityStatus.NOT_VERIFIED);
    expect(verdictApresEchec(undefined)).toBe(IdentityStatus.NOT_VERIFIED);
  });

  it('refuse definitivement un consentement retire', () => {
    expect(verdictApresEchec('consent_declined')).toBe(IdentityStatus.REFUSED);
  });

  it('refuse definitivement un pays ou un age non eligibles', () => {
    expect(verdictApresEchec('country_not_supported')).toBe(
      IdentityStatus.REFUSED,
    );
    expect(verdictApresEchec('under_supported_age')).toBe(
      IdentityStatus.REFUSED,
    );
  });
});
