import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ExchangeMessage'>;

export function ExchangeMessageScreen({ navigation, route }: any) {
  const { t } = useTranslation("contact");
  const insets = useSafeAreaInsets();
  const { homeId } = route.params;
    
  const DEFAULT_MESSAGE = t("defaultMessageContent");
    
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  function sendMessage() {
    console.log('message envoyé', message);
    navigation.navigate('HomeDetails', { homeId });
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.content}>
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