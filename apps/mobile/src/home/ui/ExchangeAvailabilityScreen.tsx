import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileStackParamList } from 'src/navigation/type/profileStack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackButton } from 'src/shared/ui/BackButton';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ExchangeAvailability'>;

export function ExchangeAvailabilityScreen({ navigation, route }: any) {
  const { t } = useTranslation(["availability", "common"]);
  const { homeId } = route.params;
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<
    'FREE' | 'EXCHANGER_DATES' | 'SPECIFIC_DATES' | null
  >(null);

  function goNext() {
    if (!selected) return;

    navigation.navigate('ExchangeMessage', {
      homeId,
      availabilityType: selected,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={navigation.goBack} style={styles.backButton} />

      <View style={styles.content}>
        <Text style={styles.title}>
          {t("when")}
        </Text>

        <Pressable
          style={[styles.option, selected === 'FREE' && styles.optionSelected]}
          onPress={() => setSelected('FREE')}
        >
          <Text style={styles.optionText}>{t("free")}</Text>
        </Pressable>

        <Pressable
          style={[
            styles.option,
            selected === 'EXCHANGER_DATES' && styles.optionSelected,
          ]}
          onPress={() => setSelected('EXCHANGER_DATES')}
        >
          <Text style={styles.optionText}> {t("exchangerDates")} </Text>
        </Pressable>

        <Pressable
          style={[
            styles.option,
            selected === 'SPECIFIC_DATES' && styles.optionSelected,
          ]}
          onPress={() => setSelected('SPECIFIC_DATES')}
        >
          <Text style={styles.optionText}> {t("specificDates")} </Text>
        </Pressable>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            bottom: insets.bottom + 90,
          },
          !selected && styles.buttonDisabled,
        ]}
        disabled={!selected}
        onPress={goNext}
      >
        <Text style={styles.buttonText}>{t("common:continue")}</Text>
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