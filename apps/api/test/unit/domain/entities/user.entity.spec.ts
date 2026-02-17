// test/unit/domain/entities/user.entity.spec.ts
import { Email } from '../../../../src/domain/value-objects/email.vo';
import { User } from '../../../../src/domain/entities/user.entity';

describe('User', () => {
  it('should create a user with email', () => {
    const user = User.create({
      email: Email.create('laura@example.com'),
    });

    expect(user.email.value).toBe('laura@example.com');
    expect(user.id).toBeDefined();
  });
});
