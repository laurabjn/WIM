import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCountryFlag } from '../../../utils/countryFlag';
import { Info } from 'lucide-react-native';
import { getCityImagesApi } from 'src/utils/cityImages';

type Props = {
  home: any;
  onInfoPress?: () => void;
};

export function SwipeTopPreview({
  home,
  onInfoPress,
}: Props) {
    const [cityImages, setCityImages] = useState<{ id: string; url: string }[]>([]);
    
    useEffect(() => {
        async function loadImages() {
            const images = await getCityImagesApi(
            home.city,
            home.country,
            );
            setCityImages(images);
        }
        loadImages();
    }, [home.city]);
    
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
        onPress={onInfoPress}
      >
        <Info size={15} color="#111" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 62,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 10,
  },
  destination: {
    width: 105,
  },
  flags: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 2,
  },
  flag: {
    fontSize: 14,
  },
  flagSmall: {
    fontSize: 12,
  },
  destinationText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: '#111',
  },
  photos: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 25,
  },
  photo: {
    width: 50,
    height: 58,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoCard: {
    width: 38,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});