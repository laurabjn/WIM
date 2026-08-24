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
import {
  AppTheme,
  DistanceUnit,
  getAllSettings,
  saveSetting,
} from '../infrastructure/settingsStorage';
import { updateMyProfile } from '../infrastructure/profile.api';
import { clearSession } from 'src/auth/infrastructure/authStorage';
import { useAppTheme, useThemeColors } from 'src/theme/ThemeContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export function SettingsScreen({ route, navigation }: Props) {
  const { t, i18n } = useTranslation(['profile', 'common', 'auth']);
  const { profile } = route.params;

  // Le theme vient du fournisseur : ecrire dans le stockage sans le prevenir
  // enregistrait le choix sans jamais l'appliquer.
  const { theme, setAppTheme } = useAppTheme();
  const colors = useThemeColors();

  // Rien n'etait charge ni enregistre : chaque reglage revenait a sa valeur par
  // defaut au retour sur l'ecran.
  useEffect(() => {
    let cancelled = false;

    async function charger() {
      const enregistres = await getAllSettings();

      if (cancelled) return;

      setCurrency(enregistres.currency);
      setDistanceUnit(enregistres.distanceUnit);
    }

    charger();

    return () => {
      cancelled = true;
    };
  }, []);

  // Les reglages de confidentialite viennent du serveur : lui seul peut les
  // faire respecter aupres des autres utilisateurs.
  const [profileVisibleServeur, setProfileVisibleServeur] = useState(
    profile.profileVisible ?? true,
  );
  const [showAgeServeur, setShowAgeServeur] = useState(profile.showAge ?? true);
  const [dataSharing, setDataSharing] = useState(profile.dataSharing ?? false);

  async function enregistrerLocal<T>(
    cle: Parameters<typeof saveSetting>[0],
    valeur: T,
    appliquer: (valeur: T) => void,
  ) {
    appliquer(valeur);

    try {
      await saveSetting(cle, valeur);
    } catch (error) {
      console.log('Save setting error:', error);
    }
  }

  async function enregistrerProfil(
    champs: Parameters<typeof updateMyProfile>[1],
    revenir: () => void,
  ) {
    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      await updateMyProfile(session.accessToken, champs);
    } catch (error) {
      console.log('Update settings error:', error);

      // On remet le commutateur ou il etait : le montrer actif alors que le
      // serveur l'ignore serait pire que l'echec lui-meme.
      revenir();

      Alert.alert('', t('profile:settings.saveError'));
    }
  }

  const [pushNotifications, setPushNotifications] = useState(
    profile.notifyPush ?? true,
  );
  const [smsNotifications, setSmsNotifications] = useState(
    profile.notifySms ?? false,
  );
  const [newMessages, setNewMessages] = useState(
    profile.notifyNewMessages ?? true,
  );
  const [newExchangeDays, setNewExchangeDays] = useState(
    profile.notifyExchanges ?? true,
  );
  const [marketingEmails, setMarketingEmails] = useState(
    profile.marketingEmails ?? false,
  );

  const [profileVisible, setProfileVisible] = useState(true);
  const [showPreciseLocation, setShowPreciseLocation] = useState(
    profile.showPreciseLocation ?? true,
  );
  const [showAge, setShowAge] = useState(true);
  const [allowMessages, setAllowMessages] = useState(
    profile.allowMessages ?? true,
  );

  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'monthly' | 'yearly'>('free');

  const fullName = useMemo(() => {
    return `${profile.firstName} ${profile.lastName}`.trim();
  }, [profile.firstName, profile.lastName]);

  const displayedEmail = profile.email || t('common:notProvided');
  const displayedPhone = profile.phone || t('common:notProvided');
  // La langue affichee suivait le profil recu en parametre, jamais rafraichi :
  // elle restait sur l'ancienne apres le changement. i18n, lui, est a jour.
  const displayedLocale =
    i18n.language?.startsWith('en') ? 'English' : 'Français';

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
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
        },
      },
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
        onPress: () => setAppTheme('light'),
      },
      {
        text: t('profile:settings.themeDark', 'Sombre'),
        onPress: () => setAppTheme('dark'),
      },
      {
        text: t('profile:settings.themeSystem', 'Système'),
        onPress: () => setAppTheme('system'),
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

  function openLanguageSelector() {
    Alert.alert(t('profile:settings.language'), '', [
      { text: 'Français', onPress: () => changerLangue('fr') },
      { text: 'English', onPress: () => changerLangue('en') },
      { text: t('common:cancel'), style: 'cancel' },
    ]);
  }

  async function changerLangue(locale: 'fr' | 'en') {
    const precedente = i18n.language;

    // On bascule l'affichage aussitot, puis on enregistre : le serveur en a
    // besoin pour les mails, qui partent dans la langue du compte.
    await i18n.changeLanguage(locale);

    await enregistrerProfil({ preferredLocale: locale }, () => {
      i18n.changeLanguage(precedente);
    });
  }

  function openDistanceUnitSelector() {
    Alert.alert(t('profile:settings.distanceUnit'), '', [
      { text: t('profile:settings.kilometers', 'Kilomètres'), onPress: () => enregistrerLocal('distanceUnit', 'km', setDistanceUnit) },
      { text: t('profile:settings.miles', 'Miles'), onPress: () => enregistrerLocal('distanceUnit', 'mi', setDistanceUnit) },
      { text: t('common:cancel'), style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.screen }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.screen }]}
        contentContainerStyle={styles.container}
      >
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
            onValueChange={(valeur) => {
              setPushNotifications(valeur);
              enregistrerProfil({ notifyPush: valeur }, () =>
                setPushNotifications(!valeur),
              );
            }}
          />
          <SettingsSwitchRow
            icon="⌕"
            label={t('profile:settings.smsNotifications')}
            value={smsNotifications}
            onValueChange={(valeur) => {
              setSmsNotifications(valeur);
              enregistrerProfil({ notifySms: valeur }, () =>
                setSmsNotifications(!valeur),
              );
            }}
          />
          <SettingsSwitchRow
            icon="✉"
            label={t('profile:settings.newMessages')}
            value={newMessages}
            onValueChange={(valeur) => {
              setNewMessages(valeur);
              enregistrerProfil({ notifyNewMessages: valeur }, () =>
                setNewMessages(!valeur),
              );
            }}
          />
          <SettingsSwitchRow
            icon="◎"
            label={t('profile:settings.updateMessages')}
            value={newExchangeDays}
            onValueChange={(valeur) => {
              setNewExchangeDays(valeur);
              enregistrerProfil({ notifyExchanges: valeur }, () =>
                setNewExchangeDays(!valeur),
              );
            }}
          />
          <SettingsSwitchRow
            icon="✉"
            label={t('profile:settings.emailMarketing')}
            value={marketingEmails}
            onValueChange={(valeur) => {
              setMarketingEmails(valeur);
              enregistrerProfil({ marketingEmails: valeur }, () =>
                setMarketingEmails(!valeur),
              );
            }}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.privacy')}>
          <SettingsSwitchRow
            icon="◉"
            label={t('profile:settings.profileVisibility')}
            value={profileVisibleServeur}
            onValueChange={(valeur) => {
              setProfileVisibleServeur(valeur);
              enregistrerProfil({ profileVisible: valeur }, () =>
                setProfileVisibleServeur(!valeur),
              );
            }}
          />

          <SettingsSwitchRow
            icon="⌖"
            label={t('profile:settings.preciseLocation')}
            value={showPreciseLocation}
            onValueChange={(valeur) => {
              setShowPreciseLocation(valeur);
              enregistrerProfil({ showPreciseLocation: valeur }, () =>
                setShowPreciseLocation(!valeur),
              );
            }}
          />

          <SettingsSwitchRow
            icon="◌"
            label={t('profile:settings.yearSharing')}
            value={showAgeServeur}
            onValueChange={(valeur) => {
              setShowAgeServeur(valeur);
              enregistrerProfil({ showAge: valeur }, () =>
                setShowAgeServeur(!valeur),
              );
            }}
          />

          <SettingsSwitchRow
            icon="✉"
            label={t('profile:settings.allowMessage')}
            value={allowMessages}
            onValueChange={(valeur) => {
              setAllowMessages(valeur);
              enregistrerProfil({ allowMessages: valeur }, () =>
                setAllowMessages(!valeur),
              );
            }}
          />

          <SettingsSwitchRow
            icon="◧"
            label={t('profile:settings.dataSharing')}
            value={dataSharing}
            onValueChange={(valeur) => {
              setDataSharing(valeur);
              enregistrerProfil({ dataSharing: valeur }, () =>
                setDataSharing(!valeur),
              );
            }}
          />

          <SettingsRow
            icon="⊘"
            label={t('profile:blocked.title')}
            value={t('profile:blocked.manage')}
            onPress={() => navigation.navigate('BlockedUsers')}
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
            onPress={openLanguageSelector}
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
            onPress={() => navigation.navigate('Help')}
          />
          <SettingsRow
            icon="◌"
            label={t('profile:settings.contactSupport')}
            onPress={() => navigation.navigate('Support', {})}
          />
          <SettingsRow
            icon="▲"
            label={t('profile:settings.problemReport')}
            onPress={() => navigation.navigate('Support', { mode: 'report' })}
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
    backgroundColor: 'transparent',
  },
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
});