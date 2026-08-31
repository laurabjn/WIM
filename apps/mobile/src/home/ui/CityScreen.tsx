import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react-native';

import { BackButton } from 'src/shared/ui/BackButton';
import { getCountryFlag } from 'src/utils/countryFlag';
import { getCityImagesApi, type ImageDeVille } from 'src/utils/cityImages';
import {
  getLocationDescription,
  type LocationDescription,
} from 'src/home/infrastructure/locationDescription.api';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  route: {
    params: {
      city: string;
      country: string;
      latitude?: number | null;
      longitude?: number | null;
    };
  };
  navigation: { goBack: () => void };
};

export function CityScreen({ route, navigation }: Props) {
  const { city, country, latitude, longitude } = route.params;
  const { t } = useTranslation(['home', 'common']);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [images, setImages] = useState<ImageDeVille[]>([]);
  const [fiche, setFiche] = useState<LocationDescription | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let abandonne = false;

    async function charger() {
      const [photos, description] = await Promise.all([
        getCityImagesApi(city, country, 3).catch(() => []),
        getLocationDescription(city, latitude, longitude, 'fr', country).catch(
          () => null,
        ),
      ]);

      if (abandonne) return;

      setImages(photos);
      setFiche(description);
      setChargement(false);
    }

    charger();

    return () => {
      abandonne = true;
    };
  }, [city, country, latitude, longitude]);

  const [affiche, ...vignettes] = images;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.entete}>
        <BackButton onPress={navigation.goBack} style={styles.rond} />
        <Text style={styles.titre} numberOfLines={1}>
          {city}
        </Text>
        <View style={styles.rond} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu}>
        {affiche ? (
          <View style={styles.afficheCadre}>
            <Image source={{ uri: affiche.grande }} style={styles.affiche} />

            <View style={styles.afficheVoile}>
              <Text style={styles.afficheVille}>{city.toUpperCase()}</Text>
              <Text style={styles.affichePays}>
                {getCountryFlag(country)} {country}
              </Text>
            </View>
          </View>
        ) : null}

        {vignettes.length > 0 ? (
          <View style={styles.vignettes}>
            {vignettes.map((image) => (
              <Image
                key={image.id}
                source={{ uri: image.url }}
                style={styles.vignette}
              />
            ))}
          </View>
        ) : null}

        {chargement ? (
          <ActivityIndicator
            style={styles.chargement}
            color={themeColors.text}
          />
        ) : fiche?.extract ? (
          <View style={styles.carte}>
            {fiche.description ? (
              <Text style={styles.sousTitre}>{fiche.description}</Text>
            ) : null}

            <Text style={styles.texte}>{fiche.extract}</Text>

            {fiche.pageUrl ? (
              <TouchableOpacity
                style={styles.lien}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(fiche.pageUrl as string)}
              >
                <ExternalLink size={16} color={themeColors.primary} />
                <Text style={styles.lienTexte}>
                  {t('home:readOnWikipedia')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={styles.carte}>
            <Text style={styles.texte}>{t('home:cityNoDescription')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.screen },
    entete: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    rond: { width: 36, height: 36 },
    titre: { flex: 1, fontSize: 17, fontWeight: '700', color: c.text, textAlign: 'center' },
    contenu: { padding: 16, gap: 12, paddingBottom: 120 },
    afficheCadre: {
      aspectRatio: 3 / 2,
      borderRadius: 18,
      overflow: 'hidden',
    },
    affiche: { width: '100%', height: '100%' },
    afficheVoile: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      padding: 14,
      backgroundColor: 'rgba(0,0,0,0.18)',
    },
    afficheVille: {
      fontSize: 24,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 1,
    },
    affichePays: { fontSize: 14, fontWeight: '600', color: '#fff' },
    vignettes: { flexDirection: 'row', gap: 8 },
    vignette: { flex: 1, height: 78, borderRadius: 12 },
    chargement: { marginTop: 30 },
    carte: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 10,
    },
    sousTitre: { fontSize: 13, fontWeight: '700', color: c.textMuted },
    texte: { fontSize: 14, lineHeight: 21, color: c.text },
    lien: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
    lienTexte: { fontSize: 14, fontWeight: '700', color: c.primary },
  });
