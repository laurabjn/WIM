import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  imageUri: string;
  location: string;
  dateRange: string;
  travelersText: string;
  onPress?: () => void;
};

export const HomeCard: React.FC<Props> = ({
  imageUri,
  location,
  dateRange,
  travelersText,
  onPress,
}) => {
  const Container = onPress ? Pressable : View;

  return (
    <Container style={styles.card} onPress={onPress}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>

        <Text style={styles.dateRange} numberOfLines={1}>
          {dateRange}
        </Text>

        <Text style={styles.travelers} numberOfLines={1}>
          {travelersText}
        </Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  image: {
    width: 96,
    height: 118,
  },

  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
  },

  location: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2A2A2A',
    marginBottom: 10,
  },

  dateRange: {
    fontSize: 20,
    fontWeight: '400',
    color: '#2A2A2A',
    marginBottom: 10,
  },

  travelers: {
    fontSize: 18,
    fontWeight: '400',
    color: '#7A7A7A',
  },
});