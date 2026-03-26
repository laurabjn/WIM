'use client';

import React from 'react';
import styles from './RegisterHousingForm.module.css';
import Image from 'next/image';

type Props = {
  title: string;
  housingTitleLabel: string;
  housingTypeLabel: string;
  housingLocationLabel: string;
  housingCapacityLabel: string;
  housingPhotoLabel: string;
  continueLabel: string;
  housingTitle: string;
  housingType: string;
  housingLocation: string;
  housingCapacity: string;
  housingPhoto: File | null;
  onHousingTitleChange: (value: string) => void;
  onHousingTypeChange: (value: string) => void;
  onHousingLocationChange: (value: string) => void;
  onHousingCapacityChange: (value: string) => void;
  onHousingPhotoChange: (file: File | null) => void;
  onBack: () => void;
  onContinue: () => void;
  isContinueDisabled: boolean;
};

export const RegisterHousingForm: React.FC<Props> = ({
  title,
  housingTitleLabel,
  housingTypeLabel,
  housingLocationLabel,
  housingCapacityLabel,
  housingPhotoLabel,
  continueLabel,
  housingTitle,
  housingType,
  housingLocation,
  housingCapacity,
  housingPhoto,
  onHousingTitleChange,
  onHousingTypeChange,
  onHousingLocationChange,
  onHousingCapacityChange,
  onHousingPhotoChange,
  onBack,
  onContinue,
  isContinueDisabled,
}) => {
  const previewUrl = housingPhoto
  ? URL.createObjectURL(housingPhoto)
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
            <input
              className={styles.input}
              placeholder={housingTitleLabel}
              value={housingTitle}
              onChange={(e) => onHousingTitleChange(e.target.value)}
            />

            <input
              className={styles.input}
              placeholder={housingTypeLabel}
              value={housingType}
              onChange={(e) => onHousingTypeChange(e.target.value)}
            />

            <input
              className={styles.input}
              placeholder={housingLocationLabel}
              value={housingLocation}
              onChange={(e) => onHousingLocationChange(e.target.value)}
            />

            <input
              className={styles.input}
              placeholder={housingCapacityLabel}
              value={housingCapacity}
              onChange={(e) => onHousingCapacityChange(e.target.value)}
            />

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
              <span>{housingPhotoLabel}</span>
              <input
                type="file"
                className={styles.photoInput}
                accept="image/*"
                onChange={(e) => onHousingPhotoChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>
        <footer className={styles.footer}>
          <button
            className={styles.continueButton}
            onClick={onContinue}
            disabled={isContinueDisabled}
          >
            {continueLabel}
          </button>
        </footer>
      </div>
    </div>
  );
};