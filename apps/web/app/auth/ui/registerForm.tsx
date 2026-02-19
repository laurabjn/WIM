'use client';

import React, { useState } from 'react';
import { registerUser } from '../application/registerUser.usecase';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email et mot de passe sont obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      // TODO: rediriger vers /login ou / (on verra plus tard)
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="firstName">Prénom</label>
        <input
          id="firstName"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="lastName">Nom</label>
        <input
          id="lastName"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Création...' : 'Créer mon compte'}
      </button>
    </form>
  );
};