import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { HomeAvailability } from '@wim/shared';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  isAvailableForExchange: boolean;
  pricePerNight: number | null;
  availabilities: HomeAvailability[];
  onChangeIsAvailableForExchange: (value: boolean) => void;
  onChangePricePerNight: (value: number | null) => void;
  onAddAvailability: (startDate: Date, endDate: Date) => Promise<void>;
  onRemoveAvailability: (availabilityId: string) => Promise<void>;
};

function formatPeriode(debut: string, fin: string): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

  return `${new Date(debut).toLocaleDateString(undefined, options)} — ${new Date(
    fin,
  ).toLocaleDateString(undefined, { ...options, year: 'numeric' })}`;
}

export function EditHomeAvailabilityTab({
  isAvailableForExchange,
  pricePerNight,
  availabilities,
  onChangeIsAvailableForExchange,
  onChangePricePerNight,
  onAddAvailability,
  onRemoveAvailability,
}: Props) {
  const { t } = useTranslation('home');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  // Une periode se saisit en deux temps : le debut, puis la fin, qui ne peut
  // pas lui etre anterieure.
  const [etape, setEtape] = useState<'start' | 'end' | null>(null);
  const [debut, setDebut] = useState(new Date());
  const [enCours, setEnCours] = useState(false);

  const ouvertes = availabilities.filter((a) => a.type === 'AVAILABLE');

  async function choisie(date?: Date) {
    const courante = etape;

    setEtape(null);

    if (!date || !courante) return;

    if (courante === 'start') {
      setDebut(date);
      setTimeout(() => setEtape('end'), 250);
      return;
    }

    if (date <= debut) return;

    setEnCours(true);

    try {
      await onAddAvailability(debut, date);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>
        {t('availabilityTitle', 'Disponibilité')}
      </Text>

      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={styles.label}>
            {t('availableForExchange', 'Disponible pour échange')}
          </Text>
          <Text style={styles.description}>
            {t(
              'availableForExchangeDescription',
              'Affiche ce logement comme disponible pour les autres utilisateurs.',
            )}
          </Text>
        </View>

        <Switch
          value={isAvailableForExchange}
          onValueChange={onChangeIsAvailableForExchange}
          trackColor={{ false: '#E5E7EB', true: '#58D6B2' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Text style={styles.inputLabel}>{t('availabilityPeriods')}</Text>

      <Text style={styles.description}>{t('availabilityPeriodsHint')}</Text>

      {ouvertes.length === 0 ? (
        <Text style={styles.emptyPeriods}>{t('availabilityNone')}</Text>
      ) : (
        ouvertes.map((periode) => (
          <View key={periode.id} style={styles.periodRow}>
            <View style={styles.periodDot} />

            <Text style={styles.periodText}>
              {formatPeriode(periode.startDate, periode.endDate)}
            </Text>

            <TouchableOpacity
              onPress={() => onRemoveAvailability(periode.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={17} color={themeColors.danger} />
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.addPeriod}
        activeOpacity={0.85}
        disabled={enCours}
        onPress={() => setEtape('start')}
      >
        <Text style={styles.addPeriodText}>{t('availabilityAdd')}</Text>
      </TouchableOpacity>

      {etape ? (
        <DateTimePicker
          value={etape === 'start' ? debut : new Date(debut.getTime() + 86400000)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={etape === 'end' ? debut : new Date()}
          onChange={(event, date) =>
            choisie(event.type === 'dismissed' ? undefined : date)
          }
        />
      ) : null}

      <Text style={styles.inputLabel}>
        {t('pricePerNight', 'Prix indicatif par nuit')}
      </Text>

      <TextInput
        value={pricePerNight === null ? '' : String(pricePerNight)}
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9]/g, '');
          onChangePricePerNight(cleaned ? Number(cleaned) : null);
        }}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#C9C9C9"
        style={styles.input}
      />
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  form: {
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
    marginBottom: 12,
  },
  row: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: c.textMuted,
  },
  emptyPeriods: {
    fontSize: 13,
    color: c.textMuted,
    marginBottom: 12,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 8,
  },
  periodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.accent,
  },
  periodText: {
    flex: 1,
    fontSize: 13,
    color: c.text,
  },
  addPeriod: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.contrast,
    marginTop: 4,
    marginBottom: 20,
  },
  addPeriodText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    fontSize: 13,
    color: c.text,
    backgroundColor: c.surface,
  },
});