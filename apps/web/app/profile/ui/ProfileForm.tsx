'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { UserProfile, SupportedLocale } from '@wim/shared';

type Props = {
  profile: UserProfile;
  onSave: (payload: Partial<UserProfile>) => Promise<void>;
};

export function ProfileForm({ profile, onSave }: Props) {
  const t = useTranslations();

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [country, setCountry] = useState(profile.country ?? '');
  const [nationality, setNationality] = useState(profile.nationality ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? '');
  const [languages, setLanguages] = useState(
    profile.languages.join(', '),
  );
  const [preferredLocale, setPreferredLocale] = useState<SupportedLocale>(
    profile.preferredLocale,
  );
  const [preferredCountries, setPreferredCountries] = useState(
    profile.travelPreferences.preferredCountries.join(', '),
  );
  const [preferredHomeTypes, setPreferredHomeTypes] = useState(
    profile.travelPreferences.preferredHomeTypes.join(', '),
  );
  const [minCapacity, setMinCapacity] = useState(
    profile.travelPreferences.minCapacity?.toString() ?? '',
  );
  const [maxCapacity, setMaxCapacity] = useState(
    profile.travelPreferences.maxCapacity?.toString() ?? '',
  );
  const [carExchangeAccepted, setCarExchangeAccepted] = useState(
    profile.travelPreferences.carExchangeAccepted ?? false,
  );
  const [flexibleDates, setFlexibleDates] = useState(
    profile.travelPreferences.flexibleDates ?? false,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await onSave({
      firstName,
      lastName,
      bio,
      country,
      nationality,
      phone: profile.phone,
      birthDate: profile.birthDate,
      languages: languages
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      preferredLocale,
      travelPreferences: {
        preferredCountries: preferredCountries
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        preferredHomeTypes: preferredHomeTypes
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        minCapacity: minCapacity ? Number(minCapacity) : null,
        maxCapacity: maxCapacity ? Number(maxCapacity) : null,
        carExchangeAccepted,
        flexibleDates,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
      <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
      <input value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Nationality" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="Birth date" />
      <input
        value={languages}
        onChange={(e) => setLanguages(e.target.value)}
        placeholder="Languages (fr, en)"
      />

      <select
        value={preferredLocale}
        onChange={(e) => setPreferredLocale(e.target.value as SupportedLocale)}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>

      <input
        value={preferredCountries}
        onChange={(e) => setPreferredCountries(e.target.value)}
        placeholder="Preferred countries"
      />
      <input
        value={preferredHomeTypes}
        onChange={(e) => setPreferredHomeTypes(e.target.value)}
        placeholder="Preferred home types"
      />
      <input
        type="number"
        value={minCapacity}
        onChange={(e) => setMinCapacity(e.target.value)}
        placeholder="Min capacity"
      />
      <input
        type="number"
        value={maxCapacity}
        onChange={(e) => setMaxCapacity(e.target.value)}
        placeholder="Max capacity"
      />

      <label>
        <input
          type="checkbox"
          checked={carExchangeAccepted}
          onChange={(e) => setCarExchangeAccepted(e.target.checked)}
        />
        Car exchange accepted
      </label>

      <label>
        <input
          type="checkbox"
          checked={flexibleDates}
          onChange={(e) => setFlexibleDates(e.target.checked)}
        />
        Flexible dates
      </label>

      <button type="submit">Save profile</button>
    </form>
  );
}