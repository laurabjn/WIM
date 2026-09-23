import React, { useEffect, useMemo, useState } from 'react';
import { VoileDePage } from 'src/shared/ui/VoileDePage';
import { Alert, Linking, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingsDangerRow } from './settings/component/SettingsDangerRow';
import { SettingsRow } from './settings/component/SettingsRow';
import { SettingsSection } from './settings/component/SettingsSection';
import { SettingsSwitchRow } from './settings/component/SettingsSwitchRow';
import { useTranslation } from 'react-i18next';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { IdentityStatus } from 'src/auth/dtos/identityStatus';
import { updateMyProfile } from '../infrastructure/profile.api';
import { clearSession } from 'src/auth/infrastructure/authStorage';
import { deleteAccountApi, exportAccountApi } from 'src/auth/infrastructure/api';
import { unregisterPushToken } from 'src/notifications/pushRegistration';
import { useAppTheme, useThemeColors } from 'src/theme/ThemeContext';
import { fetchUnreadNotificationsApi } from 'src/notifications/infrastructure/notificationCenter.api';
import { demanderLaVerificationIdentite } from 'src/auth/ui/identityGate';
import { SITE_URL } from 'src/config/api';
import { autoriserLePartage } from 'src/observabilite/sentry';
import {
  ArrowLeftRight,
  BadgeCheck,
  Ban,
  Bell,
  Cake,
  CircleQuestionMark,
  Coins,
  CreditCard,
  Download,
  Eye,
  FileText,
  Flag,
  Heart,
  Languages,
  LifeBuoy,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  Shield,
  SunMoon,
  Trash2,
  User,
} from 'lucide-react-native';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'> & {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export function SettingsScreen({ route, navigation, setIsAuthenticated }: Props) {
  const { t, i18n } = useTranslation([
    'profile',
    'common',
    'auth',
    'subscription',
    'notifications',
  ]);
  const [nonLues, setNonLues] = useState(0);
  const { profile } = route.params;

  const { theme, setAppTheme } = useAppTheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchUnreadNotificationsApi()
      .then((reponse) => setNonLues(reponse.count))
      .catch(() => setNonLues(0));
  }, []);

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

      revenir();

      Alert.alert('', t('profile:settings.saveError'));
    }
  }

  const [pushNotifications, setPushNotifications] = useState(
    profile.notifyPush ?? true,
  );
  const [newMessages, setNewMessages] = useState(
    profile.notifyNewMessages ?? true,
  );
  const [newExchangeDays, setNewExchangeDays] = useState(
    profile.notifyExchanges ?? true,
  );
  const [allowMessages, setAllowMessages] = useState(
    profile.allowMessages ?? true,
  );
  const [profileVisible, setProfileVisible] = useState(
    profile.profileVisible ?? true,
  );
  const [showPreciseLocation, setShowPreciseLocation] = useState(
    profile.showPreciseLocation ?? true,
  );
  const [showAge, setShowAge] = useState(profile.showAge ?? true);
  const [dataSharing, setDataSharing] = useState(profile.dataSharing ?? false);
  const [currency, setCurrency] = useState<'EUR' | 'USD'>(
    profile.currency === 'USD' ? 'USD' : 'EUR',
  );
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>(
    profile.distanceUnit === 'mi' ? 'mi' : 'km',
  );

  const fullName = useMemo(() => {
    return `${profile.firstName} ${profile.lastName}`.trim();
  }, [profile.firstName, profile.lastName]);

  const displayedEmail = profile.email || t('common:notProvided');
  const displayedPhone = profile.phone || t('common:notProvided');
  const displayedLocale =
    i18n.language?.startsWith('en') ? 'English' : 'Français';

  function confirmDisconnect() {
    Alert.alert(t('profile:logOutTitle'), t('profile:confirmLogOut'), [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('profile:logout'),
        style: 'destructive',
        onPress: async () => {
          await unregisterPushToken().catch(() => undefined);
          await clearSession();
          setIsAuthenticated(false);
        },
      },
    ]);
  }

  function confirmDeleteAccount() {
    Alert.alert(
      t('profile:settings.deleteAccount'),
      t('profile:settings.deleteAccountBody'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('profile:settings.deleteAccountContinue'),
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              t('profile:settings.deleteAccountLastTitle'),
              t('profile:settings.deleteAccountLastBody'),
              [
                { text: t('common:cancel'), style: 'cancel' },
                {
                  text: t('profile:settings.deleteAccountConfirm'),
                  style: 'destructive',
                  onPress: supprimerLeCompte,
                },
              ],
            ),
        },
      ],
    );
  }

  async function demanderMesDonnees() {
    const session = await getSession();

    if (!session?.accessToken) return;

    try {
      await exportAccountApi(session.accessToken);

      Alert.alert('', t('profile:settings.exportSent', { email: displayedEmail }));
    } catch (erreur: any) {
      Alert.alert('', erreur?.message ?? t('common:genericError'));
    }
  }

  async function supprimerLeCompte() {
    const session = await getSession();

    if (!session?.accessToken) return;

    try {
      await deleteAccountApi(session.accessToken);
      await unregisterPushToken().catch(() => undefined);
      await clearSession();

      Alert.alert('', t('profile:settings.deleteAccountDone'));
      setIsAuthenticated(false);
    } catch (erreur: any) {
      Alert.alert('', erreur?.message ?? t('common:genericError'));
    }
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

  function openLanguageSelector() {
    Alert.alert(t('profile:settings.language'), '', [
      { text: 'Français', onPress: () => changerLangue('fr') },
      { text: 'English', onPress: () => changerLangue('en') },
      { text: t('common:cancel'), style: 'cancel' },
    ]);
  }

  async function changerLangue(locale: 'fr' | 'en') {
    const precedente = i18n.language;

    await i18n.changeLanguage(locale);

    await enregistrerProfil({ preferredLocale: locale }, () => {
      i18n.changeLanguage(precedente);
    });
  }

  function openCurrencySelector() {
    Alert.alert(t('profile:settings.currency'), '', [
      { text: 'EUR (€)', onPress: () => changerDevise('EUR') },
      { text: 'USD ($)', onPress: () => changerDevise('USD') },
      { text: t('common:cancel'), style: 'cancel' },
    ]);
  }

  function changerDevise(valeur: 'EUR' | 'USD') {
    const precedente = currency;

    setCurrency(valeur);
    enregistrerProfil({ currency: valeur }, () => setCurrency(precedente));
  }

  function openDistanceUnitSelector() {
    Alert.alert(t('profile:settings.distanceUnit'), '', [
      { text: t('profile:settings.kilometers'), onPress: () => changerUnite('km') },
      { text: t('profile:settings.miles'), onPress: () => changerUnite('mi') },
      { text: t('common:cancel'), style: 'cancel' },
    ]);
  }

  function changerUnite(valeur: 'km' | 'mi') {
    const precedente = distanceUnit;

    setDistanceUnit(valeur);
    enregistrerProfil({ distanceUnit: valeur }, () => setDistanceUnit(precedente));
  }

  function ouvrirLaPage(chemin: string) {
    Linking.openURL(`${SITE_URL}${chemin}`).catch(() => undefined);
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.screen }]}
      edges={[]}
    >
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.screen }]}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]}
      >
        <SettingsSection title={t('profile:settings.account')}>
          <SettingsRow
            icon={User}
            label={t('profile:settings.personalInfo')}
            value={fullName || t('common:notProvided')}
            onPress={() => navigation.navigate('EditProfile', { profile })}
          />
          <SettingsRow
            icon={Mail}
            label={t('auth:register.email')}
            value={displayedEmail}
            onPress={() => navigation.navigate('EditProfile', { profile })}
          />
          <SettingsRow
            icon={Phone}
            label={t('auth:register.phone')}
            value={displayedPhone}
            onPress={() => navigation.navigate('EditProfile', { profile })}
          />
          <SettingsRow
            icon={Lock}
            label={t('auth:register.password')}
            value="••••••••"
            onPress={() => navigation.navigate('EditProfile', { profile })}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.display')}>
          <SettingsRow
            icon={SunMoon}
            label={t('profile:settings.theme')}
            value={
              theme === 'dark'
                ? t('profile:settings.themeDark', 'Sombre')
                : theme === 'system'
                  ? t('profile:settings.themeSystem', 'Système')
                  : t('profile:settings.themeLight', 'Clair')
            }
            onPress={openThemeSelector}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.verification')}>
          <SettingsRow
            icon={BadgeCheck}
            label={t('profile:settings.verificationStatus')}
            value={
              profile.identityStatus === IdentityStatus.VERIFIED
                ? t('profile:settings.verified')
                : profile.identityStatus === IdentityStatus.REFUSED
                  ? t('profile:settings.refused')
                  : profile.identityStatus === IdentityStatus.IN_PROGRESS
                    ? t('profile:settings.inProgress')
                    : t('profile:settings.notVerified')
            }
            valueColor={
              profile.identityStatus === IdentityStatus.VERIFIED
                ? '#35B77C'
                : profile.identityStatus === IdentityStatus.REFUSED
                  ? '#DC2626'
                  : '#D88500'
            }
            onPress={() =>
              profile.identityStatus === IdentityStatus.VERIFIED
                ? Alert.alert(
                    t('profile:settings.verificationStatus'),
                    t('profile:settings.verified'),
                  )
                : demanderLaVerificationIdentite()
            }
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.subscription')}>
          <SettingsRow
            icon={CreditCard}
            label={t('subscription:mine')}
            value={t('subscription:manageValue')}
            onPress={() => navigation.navigate('Subscription')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.notifications')}>
          <SettingsSwitchRow
            icon={Bell}
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
            icon={MessageCircle}
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
            icon={ArrowLeftRight}
            label={t('profile:settings.updateMessages')}
            value={newExchangeDays}
            onValueChange={(valeur) => {
              setNewExchangeDays(valeur);
              enregistrerProfil({ notifyExchanges: valeur }, () =>
                setNewExchangeDays(!valeur),
              );
            }}
          />

          <SettingsRow
            icon={Bell}
            label={t('notifications:title')}
            value={nonLues > 0 ? String(nonLues) : ''}
            onPress={() => navigation.navigate('NotificationCenter')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.privacy')}>
          <SettingsSwitchRow
            icon={Eye}
            label={t('profile:settings.profileVisibility')}
            value={profileVisible}
            onValueChange={(valeur) => {
              setProfileVisible(valeur);
              enregistrerProfil({ profileVisible: valeur }, () =>
                setProfileVisible(!valeur),
              );
            }}
          />

          <SettingsSwitchRow
            icon={MapPin}
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
            icon={Cake}
            label={t('profile:settings.yearSharing')}
            value={showAge}
            onValueChange={(valeur) => {
              setShowAge(valeur);
              enregistrerProfil({ showAge: valeur }, () => setShowAge(!valeur));
            }}
          />

          <SettingsSwitchRow
            icon={MessageCircle}
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
            icon={Share2}
            label={t('profile:settings.dataSharing')}
            value={dataSharing}
            onValueChange={(valeur) => {
              setDataSharing(valeur);
              autoriserLePartage(valeur);
              enregistrerProfil({ dataSharing: valeur }, () => {
                setDataSharing(!valeur);
                autoriserLePartage(!valeur);
              });
            }}
          />

          <SettingsRow
            icon={Ban}
            label={t('profile:blocked.title')}
            value={t('profile:blocked.manage')}
            onPress={() => navigation.navigate('BlockedUsers')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.preferences')}>
          <SettingsRow
            icon={Heart}
            label={t('profile:settings.managePreferences')}
            value={t('profile:settings.customize')}
            onPress={() => navigation.navigate('Preferences', { profile })}
          />

          <SettingsRow
            icon={Languages}
            label={t('profile:settings.language')}
            value={displayedLocale}
            onPress={openLanguageSelector}
          />

          <SettingsRow
            icon={Coins}
            label={t('profile:settings.currency')}
            value={currency === 'USD' ? 'USD ($)' : 'EUR (€)'}
            onPress={openCurrencySelector}
          />

          <SettingsRow
            icon={Ruler}
            label={t('profile:settings.distanceUnit')}
            value={
              distanceUnit === 'mi'
                ? t('profile:settings.miles')
                : t('profile:settings.kilometers')
            }
            onPress={openDistanceUnitSelector}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.assistance')}>
          <SettingsRow
            icon={CircleQuestionMark}
            label={t('profile:settings.helpCenter')}
            onPress={() => navigation.navigate('Help')}
          />
          <SettingsRow
            icon={LifeBuoy}
            label={t('profile:settings.contactSupport')}
            onPress={() => navigation.navigate('Support', {})}
          />
          <SettingsRow
            icon={Flag}
            label={t('profile:settings.problemReport')}
            onPress={() => navigation.navigate('Support', { mode: 'report' })}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.legal')}>
          <SettingsRow
            icon={FileText}
            label={t('profile:settings.termsOfService')}
            onPress={() => ouvrirLaPage('/conditions.html')}
          />
          <SettingsRow
            icon={Shield}
            label={t('profile:settings.privacyPolicy')}
            onPress={() => ouvrirLaPage('/confidentialite.html')}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.myData')}>
          <SettingsRow
            icon={Download}
            label={t('profile:settings.exportData')}
            onPress={demanderMesDonnees}
          />
        </SettingsSection>

        <SettingsSection title={t('profile:settings.dangerZone')}>
          <SettingsDangerRow
            icon={LogOut}
            label={t('profile:logout')}
            onPress={confirmDisconnect}
          />
          <SettingsDangerRow
            icon={Trash2}
            label={t('profile:settings.deleteAccount')}
            onPress={confirmDeleteAccount}
          />
        </SettingsSection>
      </ScrollView>
      <VoileDePage haut />
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
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
});
