import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';

import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { clearSession } from '../infrastructure/authStorage';
import {
  fetchIdentityStatus,
  startIdentityVerification,
} from '../infrastructure/identity.api';
import { IdentityStatus } from '../dtos/identityStatus';

type Props = {
  onVerified: () => void;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const IdentityGateScreen: React.FC<Props> = ({
  onVerified,
  setIsAuthenticated,
}) => {
  const { t } = useTranslation(['auth', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lancee, setLancee] = useState(false);
  const ouverte = useRef(false);

  const verifier = useCallback(
    async (silencieux: boolean) => {
      if (!silencieux) {
        setOccupe(true);
        setMessage(null);
      }

      try {
        const status = await fetchIdentityStatus();

        if (status === IdentityStatus.VERIFIED) {
          onVerified();
          return;
        }

        if (silencieux) return;

        if (status === IdentityStatus.IN_PROGRESS) {
          setMessage(t('auth:identity.pending'));
          return;
        }

        if (status === IdentityStatus.REFUSED) {
          setMessage(t('auth:identity.rejected'));
          return;
        }

        setMessage(t('auth:identity.retry'));
      } catch (e: any) {
        if (!silencieux) setMessage(e?.message ?? t('auth:identity.error'));
      } finally {
        if (!silencieux) setOccupe(false);
      }
    },
    [onVerified, t],
  );

  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (etat) => {
      if (etat === 'active' && ouverte.current) {
        void verifier(true);
      }
    });

    return () => abonnement.remove();
  }, [verifier]);

  const attendreLeVerdict = useCallback(async () => {
    setOccupe(true);
    setMessage(t('auth:identity.pending'));

    for (let essai = 0; essai < 10; essai += 1) {
      const status = await fetchIdentityStatus().catch(() => null);

      if (status === IdentityStatus.VERIFIED) {
        onVerified();
        return;
      }

      if (status && status !== IdentityStatus.IN_PROGRESS) break;

      await new Promise((resoudre) => setTimeout(resoudre, 1500));
    }

    await verifier(false);
  }, [onVerified, t, verifier]);

  async function ouvrirLaVerification() {
    setOccupe(true);
    setMessage(null);

    try {
      const url = await startIdentityVerification();

      ouverte.current = true;
      setLancee(true);

      await WebBrowser.openBrowserAsync(url);
      await attendreLeVerdict();
    } catch (e: any) {
      setMessage(e?.message ?? t('auth:identity.error'));
    } finally {
      setOccupe(false);
    }
  }

  async function seDeconnecter() {
    await clearSession();
    setIsAuthenticated(false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth:identity.gateTitle')}</Text>
          <Text style={styles.body}>{t('auth:identity.gateBody')}</Text>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity
            style={[styles.bouton, occupe && styles.boutonInactif]}
            disabled={occupe}
            onPress={() => (lancee ? verifier(false) : ouvrirLaVerification())}
          >
            {occupe ? (
              <ActivityIndicator color={themeColors.onContrast} />
            ) : (
              <Text style={styles.boutonTexte}>
                {lancee
                  ? t('auth:identity.gateRecheck')
                  : t('auth:identity.gateAction')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={seDeconnecter} style={styles.lien}>
            <Text style={styles.lienTexte}>{t('auth:identity.gateLogout')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const creerStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.screen },
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
      gap: 16,
    },
    title: { fontSize: 22, fontWeight: '700', color: colors.text },
    body: { fontSize: 15, lineHeight: 22, color: colors.textMuted },
    message: { fontSize: 14, color: colors.warning },
    bouton: {
      backgroundColor: colors.contrast,
      borderRadius: 999,
      paddingVertical: 16,
      alignItems: 'center',
    },
    boutonInactif: { opacity: 0.6 },
    boutonTexte: { color: colors.onContrast, fontSize: 16, fontWeight: '600' },
    lien: { alignItems: 'center', paddingVertical: 8 },
    lienTexte: { color: colors.textMuted, fontSize: 14 },
  });
