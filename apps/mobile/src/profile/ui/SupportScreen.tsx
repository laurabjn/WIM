import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { BackButton } from 'src/shared/ui/BackButton';
import { getSession } from 'src/auth/infrastructure/authStorage';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import {
  sendSupportRequest,
  SupportTopic,
} from '../infrastructure/support.api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Support'>;

const SUJETS: SupportTopic[] = [
  'account',
  'exchange',
  'booking',
  'payment',
  'technical',
  'other',
];

// Contacter le support et signaler un probleme aboutissent au meme endroit :
// seul le sujet propose par defaut change.
export function SupportScreen({ navigation, route }: Props) {
  const { t } = useTranslation(['profile', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const signalement = route.params?.mode === 'report';

  const [topic, setTopic] = useState<SupportTopic>(
    signalement ? 'technical' : 'account',
  );
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const complet = subject.trim().length > 0 && message.trim().length > 0;

  async function envoyer() {
    if (!complet || sending) return;

    setSending(true);

    try {
      const session = await getSession();

      if (!session?.accessToken) return;

      await sendSupportRequest(session.accessToken, {
        topic,
        subject: subject.trim(),
        message: message.trim(),
      });

      Alert.alert('', t('profile:support.sent'), [
        { text: t('common:ok', 'OK'), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        '',
        error instanceof Error ? error.message : t('profile:support.error'),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <BackButton onPress={navigation.goBack} />

        <Text style={styles.headerTitle}>
          {signalement
            ? t('profile:settings.problemReport')
            : t('profile:settings.contactSupport')}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>{t('profile:support.topic')}</Text>

          <View style={styles.topics}>
            {SUJETS.map((value) => {
              const selected = topic === value;

              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.chip, selected && styles.chipSelected]}
                  activeOpacity={0.8}
                  onPress={() => setTopic(value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {t(`profile:support.topics.${value}`, value)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t('profile:support.subject')}</Text>

          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder={t('profile:support.subjectPlaceholder')}
            placeholderTextColor="#B4B4B8"
            maxLength={150}
            style={styles.input}
          />

          <Text style={styles.label}>{t('profile:support.message')}</Text>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={
              signalement
                ? t('profile:support.reportPlaceholder')
                : t('profile:support.messagePlaceholder')
            }
            placeholderTextColor="#B4B4B8"
            multiline
            textAlignVertical="top"
            maxLength={5000}
            style={styles.textarea}
          />

          <Text style={styles.hint}>{t('profile:support.answerDelay')}</Text>

          <TouchableOpacity
            style={[styles.button, !complet && styles.buttonDisabled]}
            activeOpacity={0.85}
            disabled={!complet || sending}
            onPress={envoyer}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t('profile:support.send')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.surface,
  },

  flex: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },

  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: c.text,
  },

  headerSpacer: {
    width: 40,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 60,
  },

  label: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
  },

  topics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
  },

  chipSelected: {
    borderColor: c.contrast,
    backgroundColor: c.contrast,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.text,
  },

  chipTextSelected: {
    color: c.onContrast,
  },

  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    fontSize: 14,
    color: c.text,
  },

  textarea: {
    minHeight: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: c.text,
  },

  hint: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
    color: c.textMuted,
  },

  button: {
    marginTop: 22,
    height: 52,
    borderRadius: 26,
    backgroundColor: c.contrast,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.35,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: c.onContrast,
  },
});
