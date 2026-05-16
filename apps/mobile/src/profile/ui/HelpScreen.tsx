import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import {
  sendSupportRequest,
  type SupportTopic
} from '../infrastructure/support.api';
import { AuthSession, getSession } from 'src/auth/infrastructure/authStorage';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Help'>;

const HELP_TOPICS = [
  'account',
  'booking',
  'exchange',
  'payment',
  'technical',
  'other',
] as const;

type HelpTopic = SupportTopic;

export function HelpScreen({ navigation }: Props) {
  const { t } = useTranslation(['profile', 'common']);

  const [session, setSession] = useState<AuthSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const [selectedTopic, setSelectedTopic] = useState<HelpTopic>('other');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isFormValid = useMemo(() => {
    return subject.trim().length > 0 && message.trim().length > 0;
  }, [subject, message]);

  useEffect(() => {
    async function loadSession() {
      try {
        const currentSession = await getSession();
        setSession(currentSession);
      } catch (error) {
        console.log('Error loading session in help screen:', error);
        setSession(null);
      } finally {
        setIsSessionLoading(false);
      }
    }

    loadSession();
  }, []);

  const displayedEmail = session?.user.email ?? '';
  const displayedName =
    `${session?.user.firstName ?? ''} ${session?.user.lastName ?? ''}`.trim();

  async function handleSend() {
    if (!isFormValid) {
      Alert.alert(
        t('profile:helpScreen.errorTitle'),
        t('profile:helpScreen.requiredFields'),
      );
      return;
    }

    try {
      setIsSending(true);

      const session = await getSession();

      if (!session?.accessToken) {
        throw new Error('Missing token');
      }

      await sendSupportRequest(session.accessToken, {
        topic: selectedTopic,
        subject: subject.trim(),
        message: message.trim(),
      });

      Alert.alert(
        t('profile:helpScreen.successTitle'),
        t('profile:helpScreen.successMessage'),
      );

      setSubject('');
      setMessage('');
      setSelectedTopic('other');

      navigation.goBack();
    } catch (error) {
      console.log('Help send error:', error);

      Alert.alert(
        t('profile:helpScreen.errorTitle'),
        t('profile:helpScreen.errorMessage'),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {t('profile:helpScreen.title')}
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introTitle}>
            {t('profile:helpScreen.introTitle')}
          </Text>
          <Text style={styles.introText}>
            {t('profile:helpScreen.introText')}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          {t('profile:helpScreen.topicTitle')}
        </Text>

        <View style={styles.topicGrid}>
          {HELP_TOPICS.map((topic) => {
            const selected = selectedTopic === topic;

            return (
              <TouchableOpacity
                key={topic}
                style={[styles.topicChip, selected && styles.topicChipSelected]}
                onPress={() => setSelectedTopic(topic)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.topicChipText,
                    selected && styles.topicChipTextSelected,
                  ]}
                >
                  {t(`profile:helpScreen.topics.${topic}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>
            {t('profile:helpScreen.contactInfoTitle', 'Vos coordonnées')}
          </Text>

          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>
              {t('profile:helpScreen.name', 'Nom')}
            </Text>
            <Text style={styles.contactValue}>
              {displayedName || t('profile:helpScreen.notProvided', 'Non renseigné')}
            </Text>
          </View>

          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>
              {t('profile:helpScreen.email', 'Email')}
            </Text>
            <Text style={styles.contactValue}>
              {displayedEmail || t('profile:helpScreen.notProvided', 'Non renseigné')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {t('profile:helpScreen.subject')}
        </Text>

        <TextInput
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
          placeholder={t('profile:helpScreen.subjectPlaceholder')}
          placeholderTextColor="#B8B8B8"
        />

        <Text style={styles.sectionTitle}>
          {t('profile:helpScreen.message')}
        </Text>

        <TextInput
          value={message}
          onChangeText={setMessage}
          style={[styles.input, styles.textArea]}
          placeholder={t('profile:helpScreen.messagePlaceholder')}
          placeholderTextColor="#B8B8B8"
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          disabled={isSending}
          onPress={handleSend}
          activeOpacity={0.9}
          style={styles.sendButtonWrapper}
        >
          <LinearGradient
            colors={['#52D1A6', '#2DA7F3']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          >
            {isSending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>
                {t('profile:helpScreen.send')}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F4',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F3F3F4',
  },
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 16,
    color: '#111111',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  headerPlaceholder: {
    width: 36,
    height: 36,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
  },
  introText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#5F5F5F',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 10,
    marginTop: 10,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  topicChip: {
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicChipSelected: {
    backgroundColor: '#2C9B74',
    borderColor: '#2C9B74',
  },
  topicChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F1F1F',
    textAlign: 'center',
  },
  topicChipTextSelected: {
    color: '#FFFFFF',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },
  contactRow: {
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 12,
    color: '#7A7A7A',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#1F1F1F',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111111',
    marginBottom: 10,
  },
  textArea: {
    minHeight: 150,
  },
  sendButtonWrapper: {
    marginTop: 12,
  },
  sendButton: {
    width: '100%',
    minHeight: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});