import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { listMyHomes } from 'src/home/infrastructure/home.api';
import type { Home } from '@wim/shared/home/home.type';
import { requestExchangeApi } from 'src/chat/infrastructure/exchange.api';
import { BackButton } from 'src/shared/ui/BackButton';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ExchangeMessage'>;

export function ExchangeMessageScreen({ navigation, route }: any) {
  const { t } = useTranslation("contact");
  const insets = useSafeAreaInsets();
  const { homeId } = route.params;
    
  const DEFAULT_MESSAGE = t("defaultMessageContent");
    
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const [sending, setSending] = useState(false);

  // Un echange porte deux logements : celui qu'on demande, et celui qu'on
  // propose en retour. Un seul logement est choisi d'office.
  const [myHomes, setMyHomes] = useState<Home[]>([]);
  const [offeredHomeId, setOfferedHomeId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMyHomes() {
      try {
        const session = await getSession();

        if (!session?.accessToken || cancelled) return;

        const homes = await listMyHomes(session.accessToken);

        if (cancelled) return;

        setMyHomes(homes);

        if (homes.length === 1) setOfferedHomeId(homes[0].id);
      } catch (loadError) {
        console.log('Load my homes error:', loadError);
      }
    }

    loadMyHomes();

    return () => {
      cancelled = true;
    };
  }, []);

  async function sendMessage() {
    if (sending || !message.trim()) return;

    setSending(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const result = await requestExchangeApi(session.accessToken, {
        homeId,
        guestHomeId: offeredHomeId ?? undefined,
        message: message.trim(),
      });

      // La conversation vit dans l'onglet Messages : depuis les piles Logements
      // ou Profil, y aller directement echouait, et l'erreur renvoyait sur la
      // fiche du logement en laissant croire que le message n'etait pas parti.
      const parent = navigation.getParent?.();

      if (parent) {
        parent.navigate('MessagesTab', {
          screen: 'Conversation',
          params: { chatId: result.chatId },
        });
      } else {
        navigation.navigate('Conversation', { chatId: result.chatId });
      }
    } catch (error) {
      console.log('Request exchange error:', error);

      Alert.alert(
        '',
        error instanceof Error ? error.message : t('sendError'),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={navigation.goBack} style={styles.backButton} />

      <View style={styles.content}>
        <Text style={styles.title}>{t("messagePlaceholder")}</Text>

        {myHomes.length > 0 ? (
          <View style={styles.offerBox}>
            <Text style={styles.label}>{t('offeredHome')}</Text>

            <Text style={styles.offerHint}>{t('offeredHomeHint')}</Text>

            {myHomes.map((home) => {
              const selected = offeredHomeId === home.id;

              return (
                <TouchableOpacity
                  key={home.id}
                  style={[styles.offerRow, selected && styles.offerRowSelected]}
                  activeOpacity={0.8}
                  onPress={() =>
                    setOfferedHomeId(selected ? null : home.id)
                  }
                >
                  <View
                    style={[styles.radio, selected && styles.radioSelected]}
                  />

                  <Text style={styles.offerText} numberOfLines={1}>
                    {home.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        <View style={styles.messageBox}>
          <Text style={styles.label}>{t("defaultMessage")}</Text>

          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            style={styles.input}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            bottom: insets.bottom + 90,
          }
        ]}
          onPress={sendMessage}
      >
        <Text style={styles.buttonText}>{t("send")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  backText: {
    fontSize: 28,
    lineHeight: 28,
    color: '#111111',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 56,
    color: '#000000',
  },
  option: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  optionSelected: {
    borderColor: '#25A9E0',
    backgroundColor: '#EEF9FD',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25A9E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  offerBox: {
    marginBottom: 18,
  },
  offerHint: {
    marginTop: -4,
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    marginBottom: 8,
  },
  offerRowSelected: {
    borderColor: '#52D1A6',
    backgroundColor: '#F2FBF8',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioSelected: {
    borderColor: '#52D1A6',
    backgroundColor: '#52D1A6',
  },
  offerText: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
  },
  messageBox: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    padding: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
    color: '#111111',
  },
  input: {
    minHeight: 210,
    fontSize: 13,
    color: '#555555',
    lineHeight: 20,
  },
});