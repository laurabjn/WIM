import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
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
import { requestExchangeApi } from 'src/chat/infrastructure/exchange.api';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ExchangeMessage'>;

export function ExchangeMessageScreen({ navigation, route }: any) {
  const { t } = useTranslation("contact");
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const insets = useSafeAreaInsets();
  const { homeId } = route.params;
    
  const DEFAULT_MESSAGE = t("defaultMessageContent");
    
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const [sending, setSending] = useState(false);

  async function sendMessage() {
    if (sending || !message.trim()) return;

    setSending(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      const result = await requestExchangeApi(session.accessToken, {
        homeId,
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackButton onPress={navigation.goBack} style={styles.backButton} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 110 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.title}>{t("messagePlaceholder")}</Text>

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

        <TouchableOpacity
          style={[styles.button, sending && styles.buttonDisabled]}
          activeOpacity={0.85}
          disabled={sending || !message.trim()}
          onPress={sendMessage}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{t("send")}</Text>
          )}
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
    paddingHorizontal: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  backText: {
    fontSize: 28,
    lineHeight: 28,
    color: c.text,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 28,
    color: c.text,
  },
  option: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: c.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  optionSelected: {
    borderColor: '#25A9E0',
    backgroundColor: c.surfaceAlt,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
  },
  button: {
    height: 54,
    borderRadius: 27,
    backgroundColor: c.info,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    // Pose sur un aplat bleu, ce libelle reste blanc dans les deux themes.
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  flex: {
    flex: 1,
  },
  messageBox: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    padding: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
    color: c.text,
  },
  input: {
    minHeight: 180,
    fontSize: 14,
    // Un texte que l'on modifie n'est pas un texte secondaire : il etait
    // devenu gris lors du passage au theme.
    color: c.text,
    lineHeight: 20,
  },
});