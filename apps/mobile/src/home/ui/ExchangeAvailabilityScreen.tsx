import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Platform,
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
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ExchangeAvailability'>;

function formatJour(valeur: Date) {
  return valeur.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export function ExchangeAvailabilityScreen({ navigation, route }: any) {
  const { t } = useTranslation(["availability", "common"]);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const { homeId } = route.params;
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<
    'FREE' | 'EXCHANGER_DATES' | 'SPECIFIC_DATES' | null
  >(null);
  const [debut, setDebut] = useState<Date | null>(null);
  const [fin, setFin] = useState<Date | null>(null);
  const [edition, setEdition] = useState<'debut' | 'fin' | null>(null);

  function goNext() {
    if (!selected) return;

    if (selected === 'SPECIFIC_DATES' && (!debut || !fin)) return;

    navigation.navigate('ExchangeMessage', {
      homeId,
      availabilityType: selected,
      startDate: selected === 'SPECIFIC_DATES' ? debut?.toISOString() : undefined,
      endDate: selected === 'SPECIFIC_DATES' ? fin?.toISOString() : undefined,
    });
  }

  function surDateChoisie(valeur?: Date) {
    const etape = edition;

    setEdition(null);

    if (!valeur || !etape) return;

    if (etape === 'debut') {
      setDebut(valeur);

      if (fin && fin <= valeur) setFin(null);

      return;
    }

    if (debut && valeur <= debut) return;

    setFin(valeur);
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

        {selected === 'SPECIFIC_DATES' ? (
          <View style={styles.datesLigne}>
            <Pressable
              style={styles.dateChamp}
              onPress={() => setEdition('debut')}
            >
              <Text style={styles.dateTexte}>
                {debut ? formatJour(debut) : t('startDate')}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.dateChamp, !debut && styles.dateChampInactif]}
              onPress={() => debut && setEdition('fin')}
            >
              <Text style={styles.dateTexte}>
                {fin ? formatJour(fin) : t('endDate')}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {edition ? (
        <DateTimePicker
          value={
            edition === 'debut'
              ? debut ?? new Date()
              : fin ?? new Date((debut ?? new Date()).getTime() + 86400000)
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={
            edition === 'debut'
              ? new Date()
              : new Date((debut ?? new Date()).getTime() + 86400000)
          }
          onChange={(evenement, valeur) =>
            surDateChoisie(
              evenement.type === 'dismissed' ? undefined : valeur ?? undefined,
            )
          }
        />
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          {
            bottom: insets.bottom + 90,
          },
          (!selected || (selected === 'SPECIFIC_DATES' && (!debut || !fin))) &&
            styles.buttonDisabled,
        ]}
        disabled={
          !selected || (selected === 'SPECIFIC_DATES' && (!debut || !fin))
        }
        onPress={goNext}
      >
        <Text style={styles.buttonText}>{t("common:continue")}</Text>
      </TouchableOpacity>
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
  datesLigne: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  dateChamp: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dateChampInactif: {
    opacity: 0.5,
  },
  dateTexte: {
    fontSize: 13,
    color: c.text,
    fontWeight: '600',
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
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 56,
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
    minHeight: 210,
    fontSize: 13,
    color: c.textMuted,
    lineHeight: 20,
  },
});