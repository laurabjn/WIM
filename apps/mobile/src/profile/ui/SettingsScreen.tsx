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
import { IdentityStatus } from 'src/auth/dtos/identityStatus';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export function SettingsScreen({ route, navigation }: Props) {
  const { t, i18n } = useTranslation(['profile', 'common', 'auth']);
  const { profile } = route.params;

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [newMessages, setNewMessages] = useState(true);
  const [newExchangeDays, setNewExchangeDays] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const [profileVisible, setProfileVisible] = useState(true);
  const [showPreciseLocation, setShowPreciseLocation] = useState(false);
  const [showAge, setShowAge] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'monthly' | 'yearly'>('free');

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

  function openThemeSelector() {
    Alert.alert(t('profile:settings.theme'), '', [
      {
        text: t('profile:settings.themeLight', 'Clair'),
        onPress: () => setTheme('light'),
      },
      {
        text: t('profile:settings.themeDark', 'Sombre'),
        onPress: () => setTheme('dark'),
      },
      {
        text: t('profile:settings.themeSystem', 'Système'),
        onPress: () => setTheme('system'),
      },
      { text: t('common:cancel'), style: 'cancel' },
    ]);
  }

  function openSubscriptionSelector() {
    Alert.alert(t('profile:settings.subscription'), '', [
      {
        text: t('profile:settings.freeTrial', 'Essai gratuit'),
        onPress: () => setSubscriptionPlan('free'),
      },
      {
        text: t('profile:settings.monthlyPlan', 'Abonnement mensuel'),
        onPress: () => setSubscriptionPlan('monthly'),
      },
      {
        text: t('profile:settings.yearlyPlan', 'Abonnement annuel'),
        onPress: () => setSubscriptionPlan('yearly'),
      },
      { text: t('common:cancel'), style: 'cancel' },
    ]);
  }

  function openCurrencySelector() {
    Alert.alert(t('profile:settings.currency'), '', [
      { text: 'EUR (€)', onPress: () => setCurrency('EUR') },
      { text: 'USD ($)', onPress: () => setCurrency('USD') },
      { text: 'GBP (£)', onPress: () => setCurrency('GBP') },
      { text: t('common:cancel'), style: 'cancel' },
    ]);
  }

  function openDistanceUnitSelector() {
    Alert.alert(t('profile:settings.distanceUnit'), '', [
      { text: t('profile:settings.kilometers', 'Kilomètres'), onPress: () => setDistanceUnit('km') },
      { text: t('profile:settings.miles', 'Miles'), onPress: () => setDistanceUnit('mi') },
      { text: t('common:cancel'), style: 'cancel' },
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
            onPress={() => navigation.navigate('EditProfile', { profile })}
          />
          <SettingsRow
            icon="✉"
            label={t('auth:register.email')}
            value={displayedEmail}
            onPress={() => navigation.navigate('EditProfile', { profile })}
          />
          <SettingsRow
            icon="⌕"
            label={t('auth:register.phone')}
            value={displayedPhone}
            onPress={() => navigation.navigate('EditProfile', { profile })}
          />
          <SettingsRow
            icon="⌂"
            label={t('auth:register.password')}
            value="••••••••"
            onPress={() => navigation.navigate('EditProfile', { profile })}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.display')}>
          <SettingsRow
            icon="◐"
            label={t('profile:settings.theme')}
            value={
              theme === 'system'
                ? t('profile:settings.themeSystem', 'Système')
                : theme === 'dark'
                  ? t('profile:settings.themeDark', 'Sombre')
                  : t('profile:settings.themeLight', 'Clair')
            }
            onPress={openThemeSelector}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.verification')}>
          <SettingsRow
            icon="▣"
            label={t('profile:settings.verificationStatus')}
            value={
              profile.identityStatus === IdentityStatus.VERIFIED
                ? t('profile:settings.verified')
                : profile.identityStatus === IdentityStatus.REJECTED
                  ? t('profile:settings.refused')
                  : profile.identityStatus === IdentityStatus.IN_PROGRESS
                    ? t('profile:settings.inProgress')
                    : t('profile:settings.notVerified')
            }
            valueColor={
              profile.identityStatus === IdentityStatus.VERIFIED
                ? '#35B77C'
                : profile.identityStatus === IdentityStatus.REJECTED
                  ? '#DC2626'
                  : '#D88500'
            }
            onPress={() =>
              Alert.alert(
                t('profile:settings.verificationStatus'),
                t('profile:settings.verificationDelay'),
              )
            }
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.subscription')}>
          <SettingsRow
            icon="◌"
            label={t('profile:settings.subscription')}
            value={
              subscriptionPlan === 'free'
                ? t('profile:settings.freeTrial')
                : subscriptionPlan === 'monthly'
                  ? t('profile:settings.monthlyPlan')
                  : t('profile:settings.yearlyPlan')
            }
            valueColor="#35B77C"
            onPress={openSubscriptionSelector}
          />

          <SettingsRow
            icon="▤"
            label={t('profile:settings.manageSubscription')}
            onPress={() => notImplemented('Gestion du paiement')}
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
            label={t('profile:settings.preciseLocation')}
            value={showPreciseLocation}
            onValueChange={setShowPreciseLocation}
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
            value={t('profile:settings.customize')}
            onPress={() => navigation.navigate('Preferences', { profile })}
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
            value={`${currency} ${currency === 'EUR' ? '(€)' : currency === 'USD' ? '($)' : '(£)'}`}
            onPress={openCurrencySelector}
          />

          <SettingsRow
            icon="⌁"
            label={t('profile:settings.distanceUnit')}
            value={
              distanceUnit === 'km'
                ? t('profile:settings.kilometers', 'Kilomètres')
                : t('profile:settings.miles', 'Miles')
            }
            onPress={openDistanceUnitSelector}
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