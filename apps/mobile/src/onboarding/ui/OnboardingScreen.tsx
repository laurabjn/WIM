import React, { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from 'src/navigation/authStack';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { marquerIntroductionVue } from '../infrastructure/onboardingStorage';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const VISUELS = [
  require('../../../assets/onboarding/1.png'),
  require('../../../assets/onboarding/2.png'),
  require('../../../assets/onboarding/3.png'),
  require('../../../assets/onboarding/4.png'),
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(['onboarding']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => creerStyles(themeColors), [themeColors]);

  const { width } = Dimensions.get('window');
  const liste = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const ecrans = t('onboarding:slides', { returnObjects: true }) as {
    title: string;
    body: string;
  }[];

  const dernier = index >= VISUELS.length - 1;

  async function terminer() {
    await marquerIntroductionVue();
    navigation.replace('WelcomeEntry');
  }

  function avancer() {
    if (dernier) {
      void terminer();
      return;
    }

    liste.current?.scrollToIndex({ index: index + 1, animated: true });
  }

  function surDefilement(evenement: NativeSyntheticEvent<NativeScrollEvent>) {
    const position = evenement.nativeEvent.contentOffset.x;

    setIndex(Math.round(position / width));
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.entete}>
        <Text style={styles.marque}>Wim</Text>

        <TouchableOpacity onPress={terminer} hitSlop={12}>
          <Text style={styles.passer}>{t('onboarding:skip')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={liste}
        data={VISUELS}
        keyExtractor={(_, position) => String(position)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={surDefilement}
        renderItem={({ item, index: position }) => (
          <View style={[styles.page, { width }]}>
            <Image source={item} style={styles.visuel} resizeMode="contain" />

            <Text style={styles.titre}>{ecrans[position]?.title ?? ''}</Text>
            <Text style={styles.texte}>{ecrans[position]?.body ?? ''}</Text>
          </View>
        )}
      />

      <View style={styles.pastilles}>
        {VISUELS.map((_, position) => (
          <View
            key={position}
            style={[
              styles.pastille,
              position === index && styles.pastilleActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.bouton} onPress={avancer} activeOpacity={0.9}>
        <LinearGradient
          colors={['#52D1A6', '#2DA7F3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.degrade}
        >
          <Text style={styles.boutonTexte}>
            {dernier ? t('onboarding:start') : t('onboarding:continue')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const creerStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    entete: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 4,
    },
    marque: { fontSize: 24, fontWeight: '700', color: colors.text },
    passer: { fontSize: 15, color: colors.textMuted },
    page: { flex: 1, alignItems: 'center', paddingHorizontal: 28 },
    visuel: { flex: 1, width: '100%', marginBottom: 12 },
    titre: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    texte: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
      textAlign: 'center',
    },
    pastilles: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 18,
    },
    pastille: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    pastilleActive: { backgroundColor: colors.text, width: 18 },
    bouton: { marginHorizontal: 24, marginBottom: 12 },
    degrade: {
      borderRadius: 999,
      paddingVertical: 17,
      alignItems: 'center',
    },
    boutonTexte: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  });
