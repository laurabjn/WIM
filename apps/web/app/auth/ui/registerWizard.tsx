'use client';

import React, { useState } from 'react';
import { registerUser } from '../application/registerUser.usecase';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Step = 0 | 1 | 2 | 3 | 4 | 5;

export const RegisterWizard: React.FC = () => {
  const router = useRouter();
  const t = useTranslations();

  const [step, setStep] = useState<Step>(0);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nationality, setNationality] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [identityRedirectUrl, setIdentityRedirectUrl] = useState<string | null>(null);

  const [housingTitle, setHousingTitle] = useState('');
  const [housingType, setHousingType] = useState('');
  const [housingLocation, setHousingLocation] = useState('');
  const [housingCapacity, setHousingCapacity] = useState('');
  const [housingPhoto, setHousingPhoto] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardClasses =
    'w-full max-w-md bg-white rounded-[32px] shadow-md px-6 py-8 flex flex-col gap-6';

  const primaryButtonClasses =
    'w-full h-12 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full text-white font-semibold flex items-center justify-center disabled:opacity-60';

  const inputClasses =
    'w-full h-11 rounded-full border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300';

  if (step === 0) {
    return (
      <div className={cardClasses}>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          Logo
          <h1 className="text-xl font-semibold text-center">
            {t('auth.register.signUpTitle')}
          </h1>
          <p className="text-xs text-gray-500 text-center">
            {t('auth.register.usageConditions')}
          </p>
          <div className="w-full flex flex-col gap-3 mt-4">
            <button className="h-11 rounded-full border border-gray-200 flex items-center justify-center text-sm gap-2">
              {/* icône Google à ajouter si tu veux */}
              <span>{t('auth.register.googleSignUp')}</span>
            </button>
            <button className="h-11 rounded-full border border-gray-200 flex items-center justify-center text-sm gap-2">
              <span>{t('auth.register.signUpWithApple')}</span>
            </button>
          </div>
        </div>

        <button
          className={primaryButtonClasses}
          onClick={() => setStep(1)}
        >
          {t('auth.register.signUpWithEmail')}
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className={cardClasses}>
        <header className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setStep(0)}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">{t('auth.register.title')}</h1>
        </header>

        <div className="flex flex-col gap-3">
          <input
            className={inputClasses}
            placeholder={t('auth.register.lastName')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.firstName')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.birthdate')}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.nationality')}
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.countryOfResidence')}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className={primaryButtonClasses}
          onClick={() => setStep(2)}
        >
          {t('continue')}
        </button>
      </div>
    );
  }

  if (step === 2) {
    async function handleContinue() {
      setError(null);
      setIsSubmitting(true);
      try {
        // TODO : uploader avatarFile et obtenir avatarUrl si on veut le stocker dès maintenant
        const { identityRedirectUrl } = await registerUser({
          email,
          password,
          firstName,
          lastName,
        });

        setIdentityRedirectUrl(identityRedirectUrl ?? null);
        setStep(3);
      } catch (err: any) {
        setError(err.message ?? t('genericError'));
      } finally {
        setIsSubmitting(false);
      }
    }

    return (
      <div className={cardClasses}>
        <header className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setStep(1)}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">{t('auth.register.title')}</h1>
        </header>

        <div className="flex flex-col gap-3">
          <label className="w-full h-11 rounded-full border border-dashed border-gray-300 flex items-center px-4 text-sm gap-3 cursor-pointer">
            <span>📤</span>
            <span>{t('auth.register.picture')}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setAvatarFile(file);
              }}
            />
          </label>
          <textarea
            className="w-full min-h-[120px] rounded-2xl border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder={t('auth.register.biography')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <button
          className={primaryButtonClasses}
          onClick={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('auth.register.creatingAccount') : t('continue')}
        </button>
      </div>
    );
  }

  if (step === 3) {
    function handleOpenIdentity() {
      if (!identityRedirectUrl) return;
      window.location.assign(identityRedirectUrl);
    }

    function handleDoneIdentity() {
      // plus tard: appeler /identity/status et vérifier VERIFIED
      setStep(4);
    }

    return (
      <div className={cardClasses}>
        <header className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setStep(2)}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">{t('auth.register.title')}</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-base font-semibold text-center mb-6">
            {t('auth.register.identityVerification')}
          </p>
          <button
            className="mb-4 h-11 px-6 rounded-full border border-gray-200 text-sm"
            onClick={handleOpenIdentity}
            disabled={!identityRedirectUrl}
          >
            {t('auth.register.beginIdentityVerification')}
          </button>
          <p className="text-xs text-gray-500 text-center px-6">
            {t('auth.register.afterIdentityVerification')}
          </p>
        </div>

        <button
          className={primaryButtonClasses}
          onClick={handleDoneIdentity}
        >
          {t('continue')}
        </button>
      </div>
    );
  }

    if (step === 4) {
    return (
      <div className={cardClasses}>
        <header className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setStep(3)}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">{t('auth.register.title')}</h1>
        </header>

        <div className="flex flex-col gap-3">
          <input
            className={inputClasses}
            placeholder={t('auth.register.housingTitle')}
            value={housingTitle}
            onChange={(e) => setHousingTitle(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.housingType')}
            value={housingType}
            onChange={(e) => setHousingType(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.housingLocation')}
            value={housingLocation}
            onChange={(e) => setHousingLocation(e.target.value)}
          />
          <input
            className={inputClasses}
            placeholder={t('auth.register.housingCapacity')}
            value={housingCapacity}
            onChange={(e) => setHousingCapacity(e.target.value)}
          />
          <label className="w-full h-11 rounded-full border border-dashed border-gray-300 flex items-center px-4 text-sm gap-3 cursor-pointer">
            <span>📤</span>
            <span>{t('auth.register.housingPhoto')}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setHousingPhoto(file);
              }}
            />
          </label>
        </div>

        <button
          className={primaryButtonClasses}
          onClick={() => setStep(5)}
        >
          {t('continue')}
        </button>
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        Logo
        <h1 className="text-xl font-semibold text-center">
          {t('auth.register.welcomeTitle')}
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        <button className="h-11 rounded-full border border-gray-200 text-sm">
          {t('auth.register.guidedTour')}
        </button>
        <button
          className={primaryButtonClasses}
          onClick={() => router.push('/')}
        >
          {t('auth.register.goToWim')}
        </button>
      </div>
    </div>
  );
};