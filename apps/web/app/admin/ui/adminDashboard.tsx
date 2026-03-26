'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export const AdminDashboard: React.FC = () => {
  const t = useTranslations('admin');

  const rows = [
    {
      key: 'identity',
      label: t('adminFeatureIdentity'),
      value: t('adminComingSoon'),
    },
    {
      key: 'matching',
      label: t('adminFeatureMatching'),
      value: t('adminComingSoon'),
    },
    {
      key: 'billing',
      label: t('adminFeatureBilling'),
      value: t('adminComingSoon'),
    },
  ];

  return (
    <section>
      <h1>{t('adminTitle')}</h1>
      <p>{t('adminSubtitle')}</p>

      <table>
        <thead>
          <tr>
            <th>{t('adminTableHeaderName')}</th>
            <th>{t('adminTableHeaderValue')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};