'use client';

import React, { useState } from 'react';
import { registerUser } from '../application/registerUser.usecase';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RegisterStep1Form } from './form/RegisterStep1Form';
import { RegisterStep2Form } from './form/Registerstep2Form';
import { RegisterStep3Form } from './form/RegisterStep3Form';
import { RegisterStep4Form } from './form/RegisterStep4Form';
import { RegisterStep5Form } from './form/RegisterStep5Form';
import { RegisterIdentityForm } from './form/RegisterIdentityForm';
import { RegisterHousingForm } from './form/RegisterHousingForm';
import { RegisterWelcome } from './RegisterWelcome';
import styles from './registerWizard.module.css';
import Image from 'next/image';
import { uploadProfileImage } from '../infrastructure/uploadProfileImage';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const RegisterWizard: React.FC = () => {
  const router = useRouter();
  const t = useTranslations();

  const [step, setStep] = useState<Step>(0);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nationality, setNationality] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  if (step === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.centerBlock}>
            <div className={styles.logo}>
              <Image src="/logo.jpg" alt="Wim" width={42} height={42} />
            </div>

            <h1 className={styles.title}>
              {t('auth.register.signUpTitle')}
            </h1>

            <p className={styles.description}>
              {t('auth.register.usageConditions')}
            </p>

            <div className={styles.actions}>
              <button className={styles.secondaryButton}>
                <span>{t('auth.register.googleSignUp')}</span>
              </button>

              <button className={styles.secondaryButton}>
                <span>{t('auth.register.signUpWithApple')}</span>
              </button>
            </div>
          </div>

          <button
            className={styles.primaryButton}
            onClick={() => setStep(1)}
          >
            {t('auth.register.signUpWithEmail')}
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    const isValid =
      lastName.trim() !== '' &&
      firstName.trim() !== '' &&
      birthDate.trim() !== '';

    return (
      <RegisterStep1Form
        title={t('auth.register.title')}
        sectionTitle={t('auth.register.whoAreYou')}
        lastNameLabel={t('auth.register.lastName')}
        firstNameLabel={t('auth.register.firstName')}
        birthDateLabel={t('auth.register.birthdate')}
        continueLabel={t('common.continue')}
        lastName={lastName}
        firstName={firstName}
        birthDate={birthDate}
        onLastNameChange={setLastName}
        onFirstNameChange={setFirstName}
        onBirthDateChange={setBirthDate}
        onBack={() => setStep(0)}
        onContinue={() => setStep(2)}
        isContinueDisabled={!isValid}
      />
    );
  }

  if (step === 2) {
    const isValid = nationality.trim() !== '' && country.trim() !== '';

    return (
      <RegisterStep2Form
        title={t('auth.register.title')}
        sectionTitle={t('auth.register.whereAreYouFrom')}
        nationalityLabel={t('auth.register.nationality')}
        countryLabel={t('auth.register.countryOfResidence')}
        continueLabel={t('common.continue')}
        nationality={nationality}
        country={country}
        onNationalityChange={setNationality}
        onCountryChange={setCountry}
        onBack={() => setStep(1)}
        onContinue={() => setStep(3)}
        isContinueDisabled={!isValid}
      />
    );
  }

  if (step === 3) {
  const isValid = email.trim() !== '' && phone.trim() !== '';

    return (
      <RegisterStep3Form
        title={t('auth.register.title')}
        sectionTitle={t('auth.register.yourContact')}
        emailLabel={t('auth.register.email')}
        phoneLabel={t('auth.register.phone')}
        continueLabel={t('common.continue')}
        email={email}
        phone={phone}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
        onBack={() => setStep(2)}
        onContinue={() => setStep(4)}
        isContinueDisabled={!isValid}
      />
    );
  }

  if (step === 4) {
    const isPasswordValid = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    const isValid =
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password === confirmPassword &&
      isPasswordValid;
    
    return (
      <RegisterStep4Form
        title={t('auth.register.title')}
        sectionTitle={t('auth.register.createPassword')}
        passwordLabel={t('auth.register.password')}
        confirmPasswordLabel={t('auth.register.confirmPassword')}
        continueLabel={t('common.continue')}
        password={password}
        confirmPassword={confirmPassword}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onBack={() => setStep(3)}
        onContinue={() => setStep(5)}
        isContinueDisabled={!isValid}
      />
    );
  }

  if (step === 5) {
    async function handleContinue() {
      setError(null);
      setIsSubmitting(true);

      try {
        let avatarUrl: string | undefined = undefined;

        if (avatarFile) {
          avatarUrl = await uploadProfileImage(avatarFile);
        }

        const normalizedBirthDate = birthDate
          ? new Date(birthDate).toISOString()
          : birthDate;
        
        const { identityRedirectUrl } = await registerUser({
          email,
          password,
          firstName,
          lastName,
          birthDate: normalizedBirthDate,
          nationality,
          country,
          phone,
          bio,
          avatarUrl,
          isAdmin: false,
        });

        setIdentityRedirectUrl(identityRedirectUrl ?? null);
        setStep(6);
      } catch (err: any) {
        setError(err.message ?? t('genericError'));
      } finally {
        setIsSubmitting(false);
      }
    }

    const isValid = bio.trim() !== '' && avatarFile !== null;

    return (
      <RegisterStep5Form
        title={t('auth.register.title')}
        pictureLabel={t('auth.register.picture')}
        biographyLabel={t('auth.register.biography')}
        continueLabel={t('common.continue')}
        creatingAccountLabel={t('auth.register.creatingAccount')}
        bio={bio}
        avatarFile={avatarFile}
        error={error}
        isSubmitting={isSubmitting}
        onBioChange={setBio}
        onAvatarChange={setAvatarFile}
        onBack={() => setStep(4)}
        onContinue={handleContinue}
        isContinueDisabled={!isValid}
      />
    );
  }

  if (step === 6) {
    function handleOpenIdentity() {
      if (!identityRedirectUrl) return;
      window.location.assign(identityRedirectUrl);
    }

    function handleDoneIdentity() {
      // TODO plus tard :
      // appeler ton endpoint /identity/status
      // vérifier que le statut est VERIFIED
      setStep(7);
    }

    return (
      <RegisterIdentityForm
        title={t('auth.register.title')}
        sectionTitle={t('auth.register.identityVerification')}
        continueLabel={t('common.continue')}
        identityRedirectUrl={identityRedirectUrl}
        onBack={() => setStep(5)}
        onOpenIdentity={handleOpenIdentity}
        onContinue={handleDoneIdentity}
      />

    );
  }

  if (step === 7) {
    const isValid =
      housingTitle.trim() !== '' &&
      housingType.trim() !== '' &&
      housingLocation.trim() !== '' &&
      housingCapacity.trim() !== '' &&
      housingPhoto !== null;

    return (
      <RegisterHousingForm
        title={t('auth.register.title')}
        housingTitleLabel={t('auth.register.housingTitle')}
        housingTypeLabel={t('auth.register.housingType')}
        housingLocationLabel={t('auth.register.housingLocation')}
        housingCapacityLabel={t('auth.register.housingCapacity')}
        housingPhotoLabel={t('auth.register.housingPhoto')}
        continueLabel={t('common.continue')}
        housingTitle={housingTitle}
        housingType={housingType}
        housingLocation={housingLocation}
        housingCapacity={housingCapacity}
        housingPhoto={housingPhoto}
        onHousingTitleChange={setHousingTitle}
        onHousingTypeChange={setHousingType}
        onHousingLocationChange={setHousingLocation}
        onHousingCapacityChange={setHousingCapacity}
        onHousingPhotoChange={setHousingPhoto}
        onBack={() => setStep(6)}
        onContinue={() => setStep(8)}
        isContinueDisabled={!isValid}
      />
    );
  }

  if (step === 8) {
    return (
    <RegisterWelcome
      welcomeTitle={t('auth.welcomeTitle')}
      guidedTourLabel={t('auth.guidedTour')}
      goToWimLabel={t('auth.goToWim')}
      onGuidedTour={() => {
        // TODO guided tour
      }}
      onGoToWim={() => router.push('/')}
    />
    );
  }

  return null;
};