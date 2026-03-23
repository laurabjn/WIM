'use client';

import React from 'react';
import styles from './RegisterStep5Form.module.css';
import Image from 'next/image';

type Props = {
  title: string;
  pictureLabel: string;
  biographyLabel: string;
  continueLabel: string;
  creatingAccountLabel: string;
  bio: string;
  avatarFile: File | null;
  error: string | null;
  isSubmitting: boolean;
  onBioChange: (value: string) => void;
  onAvatarChange: (file: File | null) => void;
  onBack: () => void;
  onContinue: () => void;
  isContinueDisabled: boolean;
};

export const RegisterStep5Form: React.FC<Props> = ({
  title,
  pictureLabel,
  biographyLabel,
  continueLabel,
  creatingAccountLabel,
  bio,
  avatarFile,
  error,
  isSubmitting,
  onBioChange,
  onAvatarChange,
  onBack,
  onContinue,
  isContinueDisabled,
}) => {
  const previewUrl = avatarFile
  ? URL.createObjectURL(avatarFile)
  : null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            onClick={onBack}
            className={styles.backButton}
          >
            ←
          </button>
          <h1 className={styles.headerTitle}>{title}</h1>
        </header>

        <div className={styles.content}>
          <div className={styles.fields}>
            {previewUrl && (
              <div className={styles.preview}>
                <Image
                  src={previewUrl}
                  alt="preview"
                  width={70}
                  height={70}
                  className={styles.previewImg}
                  unoptimized
                />
              </div>
            )}
            <label className={styles.photoLabel}>
              <span>📤</span>
              <span>{pictureLabel}</span>
              <input
                type="file"
                className={styles.photoInput}
                accept="image/*"
                onChange={(e) => onAvatarChange(e.target.files?.[0] ?? null)}
              />
            </label>

            <textarea
              className={styles.textarea}
              placeholder={biographyLabel}
              value={bio}
              onChange={(e) => onBioChange(e.target.value.slice(0, 200))}
            />

            <p className={styles.charCount}>{bio.length} / 200</p>

            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
        <footer className={styles.footer}>
          <button
            className={styles.continueButton}
            onClick={onContinue}
            disabled={isContinueDisabled || isSubmitting}
          >
            {isSubmitting ? creatingAccountLabel : continueLabel}
          </button>
        </footer>
      </div>
    </div>
  );
};