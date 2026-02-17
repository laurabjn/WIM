// test/unit/domain/value-objects/email.vo.spec.ts
import { Email } from '../../../../src/domain/value-objects/email.vo';

describe('Email', () => {
  it('should accept a valid email', () => {
    const email = Email.create('laura@example.com');
    expect(email.value).toBe('laura@example.com');
  });

  it('should throw on invalid email', () => {
    expect(() => Email.create('not-an-email')).toThrow('Invalid email');
  });
});
