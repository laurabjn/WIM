import { User } from 'src/domain/auth/entities/user.entity';

describe('User', () => {
  it('should create a user with email', () => {
    const user = User.create({
      email: 'laura@example.com',
      firstName: 'Laura',
      lastName: 'Smith',
      passwordHash: 'securePassword123',
      avatarUrl: null,
      bio: null,
      country: null,
      nationality: null,
      phone: null,
      birthDate: null,
    });

    expect(user.email).toBe('laura@example.com');
    expect(user.id).toBeDefined();
  });
});
