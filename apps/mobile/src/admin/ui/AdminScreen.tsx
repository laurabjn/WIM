import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { getIsAdmin } from '../../auth/infrastructure/authStorage';
import { useTranslation } from 'react-i18next';

export const AdminScreen: React.FC = () => {
  const { t } = useTranslation('auth');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    getIsAdmin().then(setIsAdmin);
  }, []);

  if (isAdmin === null) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View>
        <Text>{t('adminNoAccess')}</Text>
      </View>
    );
  }

  const rows = [
    { key: 'identity', label: t('adminFeatureIdentity'), value: t('adminComingSoon') },
    { key: 'matching', label: t('adminFeatureMatching'), value: t('adminComingSoon') },
    { key: 'billing', label: t('adminFeatureBilling'), value: t('adminComingSoon') },
  ];

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        {t('adminTitle')}
      </Text>
      <Text style={{ marginBottom: 16 }}>{t('adminSubtitle')}</Text>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{item.label}</Text>
            <Text>{item.value}</Text>
          </View>
        )}
      />
    </View>
  );
};