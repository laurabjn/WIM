import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsDangerRow } from './settings/component/SettingsDangerRow';
import { SettingsRow } from './settings/component/SettingsRow';
import { SettingsSection } from './settings/component/SettingsSection';
import { SettingsSwitchRow } from './settings/component/SettingsSwitchRow';
import { useTranslation } from 'react-i18next';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export function SettingsScreen({ route }: Props) {
  const { t, i18n } = useTranslation(['profile', 'common', 'auth']);
  const { profile } = route.params;

  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [newMessages, setNewMessages] = useState(true);
  const [newExchangeDays, setNewExchangeDays] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const [profileVisible, setProfileVisible] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showAge, setShowAge] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

  const fullName = useMemo(() => {
    return `${profile.firstName} ${profile.lastName}`.trim();
  }, [profile.firstName, profile.lastName]);

  const displayedEmail = profile.email || t('common:notProvided');
  const displayedPhone = profile.phone || t('common:notProvided');
  const displayedLocale =
    profile.preferredLocale === 'fr' ? 'Français' : 'English';

  const displayedNationality = profile.nationality || t('common:notProvided');

  const displayedBirthDate = profile.birthDate
    ? new Date(profile.birthDate).toLocaleDateString('fr-FR')
    : t('common:notProvided');

  function notImplemented(label: string) {
    Alert.alert('À faire', label);
  }

  function confirmDisconnect() {
    Alert.alert('Déconnexion', 'Veux-tu vraiment te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => notImplemented('Déconnexion') },
    ]);
  }

  function confirmDeleteAccount() {
    Alert.alert('Supprimer mon compte', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => notImplemented('Suppression du compte') },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <SettingsSection title={t('profile:settings.account')}>
          <SettingsRow
            icon="◎"
            label={t('profile:settings.personalInfo')}
            value={fullName || t('common:notProvided')}
            onPress={() => notImplemented('Informations personnelles')}
          />
          <SettingsRow
            icon="✉"
            label={t('auth:register.email')}
            value={displayedEmail}
            onPress={() => notImplemented('Email')}
          />
          <SettingsRow
            icon="⌕"
            label={t('auth:register.phone')}
            value={displayedPhone}
            onPress={() => notImplemented('Téléphone')}
          />
          <SettingsRow
            icon="⌂"
            label={t('auth:register.password')}
            value="••••••••"
            onPress={() => notImplemented('Mot de passe')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.display')}>
          <SettingsRow
            icon="◐"
            label={t('profile:settings.theme')}
            value="système"
            onPress={() => notImplemented('Thème')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.verification')}>
          <SettingsRow
            icon="▣"
            label={t('profile:settings.verificationStatus')}
            value="Vérifié"
            valueColor="#35B77C"
            onPress={() => notImplemented('Statut de vérification')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.subscription')}>
          <SettingsRow
            icon="◌"
            label={t('profile:settings.subscription')}
            value="Actif"
            valueColor="#35B77C"
            onPress={() => notImplemented('Abonnement')}
          />
          <SettingsRow
            icon="▤"
            label={t('profile:settings.manageSubscription')}
            onPress={() => notImplemented('Gérer l’abonnement')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.notifications')}>
          <SettingsSwitchRow
            icon="⌂"
            label={t('profile:settings.pushNotifications')}
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          <SettingsSwitchRow
            icon="⌕"
            label={t('profile:settings.smsNotifications')}
            value={smsNotifications}
            onValueChange={setSmsNotifications}
          />
          <SettingsSwitchRow
            icon="✉"
            label={t('profile:settings.newMessages')}
            value={newMessages}
            onValueChange={setNewMessages}
          />
          <SettingsSwitchRow
            icon="◎"
            label={t('profile:settings.updateMessages')}
            value={newExchangeDays}
            onValueChange={setNewExchangeDays}
          />
          <SettingsSwitchRow
            icon="✉"
            label={t('profile:settings.emailMarketing')}
            value={marketingEmails}
            onValueChange={setMarketingEmails}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.privacy')}>
          <SettingsSwitchRow
            icon="◉"
            label={t('profile:settings.profileVisibility')}
            value={profileVisible}
            onValueChange={setProfileVisible}
          />
          <SettingsSwitchRow
            icon="⌖"
            label={t('profile:settings.locationSharing')}
            value={showLocation}
            onValueChange={setShowLocation}
          />
          <SettingsSwitchRow
            icon="◌"
            label={t('profile:settings.yearSharing')}
            value={showAge}
            onValueChange={setShowAge}
          />
          <SettingsSwitchRow
            icon="✉"
            label={t('profile:settings.allowMessage')}
            value={allowMessages}
            onValueChange={setAllowMessages}
          />
          <SettingsRow
            icon="◧"
            label={t('profile:settings.dataSharing')}
            onPress={() => notImplemented('Partage de données')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.preferences')}>
          <SettingsRow
            icon="♡"
            label={t('profile:settings.managePreferences')}
            value="Personnaliser"
            onPress={() => notImplemented('Gérer mes préférences')}
          />
          <SettingsRow
            icon="⌘"
            label={t('profile:settings.language')}
            value={displayedLocale}
            onPress={() => notImplemented('Langue')}
          />
          <SettingsRow
            icon="€"
            label={t('profile:settings.currency')}
            value="EUR (€)"
            onPress={() => notImplemented('Devise')}
          />
          <SettingsRow
            icon="⌁"
            label={t('profile:settings.distanceUnit')}
            value="Kilomètres"
            onPress={() => notImplemented('Unité de distance')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.assistance')}>
          <SettingsRow
            icon="?"
            label={t('profile:settings.helpCenter')}
            onPress={() => notImplemented('Centre d’aide')}
          />
          <SettingsRow
            icon="◌"
            label={t('profile:settings.contactSupport')}
            onPress={() => notImplemented('Contacter le support')}
          />
          <SettingsRow
            icon="▲"
            label={t('profile:settings.problemReport')}
            onPress={() => notImplemented('Signaler un problème')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.legal')}>
          <SettingsRow
            icon="▣"
            label={t('profile:settings.termsOfService')}
            onPress={() => notImplemented('Conditions d’utilisation')}
          />
          <SettingsRow
            icon="▤"
            label={t('profile:settings.privacyPolicy')}
            onPress={() => notImplemented('Politique de confidentialité')}
          />
          <SettingsRow
            icon="▥"
            label={t('profile:settings.licenses')}
            onPress={() => notImplemented('Licences open source')}
          />
          <SettingsRow
            icon="ⓘ"
            label={t('profile:settings.about')}
            value="v1.0.0"
            onPress={() => notImplemented('À propos')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.dangerZone')}>
          <SettingsDangerRow
            icon="⇥"
            label={t('profile:logout')}
            onPress={confirmDisconnect}
          />
          <SettingsDangerRow
            icon="🗑"
            label={t('profile:settings.deleteAccount')}
            onPress={confirmDeleteAccount}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
});