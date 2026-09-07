import React, { useEffect, useState, useMemo } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { getCountryFlag } from '../../../utils/countryFlag';
import { Info } from 'lucide-react-native';
import { getCityImagesApi } from 'src/utils/cityImages';
import { getLocationDescription } from 'src/home/infrastructure/locationDescription.api';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';

type Props = {
  home: any;
};

export function SwipeTopPreview({ home }: Props) {
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
    const [cityImages, setCityImages] = useState<{ id: string; url: string }[]>([]);
    
    const { i18n } = useTranslation();
    const langue = i18n.language?.startsWith('en') ? 'en' : 'fr';
    const [lienVille, setLienVille] = useState<string | null>(null);

    useEffect(() => {
        let abandonne = false;

        async function loadImages() {
            const images = await getCityImagesApi(
            home.city,
            home.country,
            );
            if (!abandonne) setCityImages(images);
        }

        async function loadLien() {
            const fiche = await getLocationDescription(
                home.city,
                home.latitude,
                home.longitude,
                langue,
                home.country,
            ).catch(() => null);

            if (!abandonne) setLienVille(fiche?.pageUrl ?? null);
        }

        loadImages();
        loadLien();

        return () => {
            abandonne = true;
        };
    }, [home.city, home.country, home.latitude, home.longitude, langue]);

    function ouvrirLaVille() {
        const recherche = `https://${langue}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
            home.city,
        )}`;

        Linking.openURL(lienVille ?? recherche).catch(() => undefined);
    }
    
  return (
    <View style={styles.container}>
      <View style={styles.destination}>
        <View style={styles.flags}>
          <Text style={styles.flag}>
            {getCountryFlag(home.country)}
          </Text>
        </View>
        <Text style={styles.destinationText}>
          {home.city},{'\n'}
          {home.country}
        </Text>
      </View>

      <View style={styles.photos}>
        {cityImages.map((photo) => (
            <Image
                key={photo.id}
                source={{ uri: photo.url }}
                style={styles.photo}
            />
        ))}
      </View>
          
      <TouchableOpacity
        style={styles.infoCard}
        onPress={ouvrirLaVille}
      >
        <Info size={15} color={themeColors.text} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
  container: {
    height: 86,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 10,
  },
  destination: {
    width: 96,
  },
  flags: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 2,
  },
  flag: {
    color: c.text,
    fontSize: 14,
  },
  flagSmall: {
    fontSize: 12,
  },
  destinationText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: c.text,
  },
  photos: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    gap: 4,
  },
  photo: {
    flex: 1,
    maxWidth: 68,
    height: 78,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoCard: {
    width: 42,
    height: 78,
    borderRadius: 12,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});