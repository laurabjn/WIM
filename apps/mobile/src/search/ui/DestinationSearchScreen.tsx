import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Search, User } from 'lucide-react-native';
import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const suggestions = [
  'San Francisco, USA',
  'San Diego, USA',
  'San Sebastian, Espagne',
  'Sanita',
];

type Props = NativeStackScreenProps<SearchStackParamList, 'DestinationSearch'>;

export const DestinationSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const [query, setQuery] = useState(route.params?.currentDestination ?? '');

  const filteredSuggestions = suggestions.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  function selectDestination(destination: string) {
    route.params?.onSelectDestination?.(destination);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.searchBox}>
          <Search size={18} color="#111" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Destination"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        <View style={styles.list}>
          {filteredSuggestions.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.item}
              onPress={() => selectDestination(item)}
            >
              {item === 'Sanita' ? (
                <User size={15} color="#111" />
              ) : (
                <MapPin size={15} color="#111" />
              )}

              <Text style={styles.itemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  searchBox: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  list: {
    marginTop: 24,
    gap: 22,
    paddingLeft: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
});