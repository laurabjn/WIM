import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Minus,
  Navigation,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { SearchStackParamList } from 'src/navigation/type/searchTabs';
import { BackButton } from 'src/shared/ui/BackButton';
import { useThemeColors } from 'src/theme/ThemeContext';
import type { ThemeColors } from 'src/theme/colors';
import { SelecteurDeDate } from './components/SelecteurDeDate';
import { LigneDestination } from './components/LigneDestination';
import {
  FILTRES_VIDES,
  SearchFiltersSheet,
  compterFiltres,
  type FiltresRecherche,
} from './components/SearchFiltersSheet';
import {
  DestinationSuggestion,
  searchDestinationsApi,
} from '../infrastructure/mapboxSearch.api';
import {
  DestinationRecente,
  getRecentDestinations,
  saveRecentDestination,
} from '../infrastructure/recentDestination.storage';
import { getDestinationsPopulaires } from '../infrastructure/destinationsPopulaires';
import { destinationAutourDeMoi } from '../infrastructure/positionActuelle';

type Props = NativeStackScreenProps<SearchStackParamList, 'Search'>;
type Section = 'ou' | 'quand' | 'qui';

const FOND_PROXIMITE = 'rgba(45, 167, 243, 0.15)';
const LONGUEUR_MINIMALE = 2;
const DELAI_SAISIE = 300;

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation('search');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [sectionOuverte, setSectionOuverte] = useState<Section>('ou');
  const [destination, setDestination] = useState<DestinationSuggestion | null>(null);
  const [saisie, setSaisie] = useState('');
  const [propositions, setPropositions] = useState<DestinationSuggestion[]>([]);
  const [recentes, setRecentes] = useState<DestinationRecente[]>([]);
  const [populaires, setPopulaires] = useState<DestinationSuggestion[]>([]);
  const [chercheProposition, setChercheProposition] = useState(false);
  const [cherchePosition, setCherchePosition] = useState(false);

  const [dateDebut, setDateDebut] = useState<Date | null>(null);
  const [dateFin, setDateFin] = useState<Date | null>(null);
  const [selecteurOuvert, setSelecteurOuvert] = useState<'debut' | 'fin' | null>(null);
  const [voyageurs, setVoyageurs] = useState(0);

  const [filtres, setFiltres] = useState<FiltresRecherche>(FILTRES_VIDES);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  const recherche = saisie.trim();
  const chercheUneVille = recherche.length >= LONGUEUR_MINIMALE;

  useEffect(() => {
    getRecentDestinations().then(setRecentes);
    getDestinationsPopulaires().then(setPopulaires);
  }, []);

  useEffect(() => {
    if (!chercheUneVille) {
      setPropositions([]);
      return;
    }

    let abandonne = false;
    setChercheProposition(true);

    const minuteur = setTimeout(async () => {
      try {
        const trouvees = await searchDestinationsApi(recherche, i18n.language);

        if (!abandonne) setPropositions(trouvees);
      } finally {
        if (!abandonne) setChercheProposition(false);
      }
    }, DELAI_SAISIE);

    return () => {
      abandonne = true;
      clearTimeout(minuteur);
    };
  }, [recherche, chercheUneVille, i18n.language]);

  function formatDate(date: Date) {
    return date.toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'short',
    });
  }

  function periode(debut?: string, fin?: string) {
    if (!debut || !fin) return null;

    return `${formatDate(new Date(debut))} – ${formatDate(new Date(fin))}`;
  }

  function enDateApi(date: Date | null): string | undefined {
    if (!date) return undefined;

    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');

    return `${annee}-${mois}-${jour}`;
  }

  function choisirDestination(choix: DestinationSuggestion) {
    setDestination(choix);
    setSaisie('');
    setPropositions([]);
    setSectionOuverte(dateDebut ? 'qui' : 'quand');
  }

  async function utiliserMaPosition() {
    setCherchePosition(true);

    try {
      const autour = await destinationAutourDeMoi();

      if (autour) choisirDestination(autour);
    } finally {
      setCherchePosition(false);
    }
  }

  function toutEffacer() {
    setDestination(null);
    setSaisie('');
    setPropositions([]);
    setDateDebut(null);
    setDateFin(null);
    setVoyageurs(0);
    setFiltres(FILTRES_VIDES);
    setSectionOuverte('ou');
  }

  function lancerLaRecherche() {
    if (destination) {
      saveRecentDestination({
        ...destination,
        startDate: enDateApi(dateDebut),
        endDate: enDateApi(dateFin),
      });
    }

    navigation.navigate('SearchResults', {
      city: destination?.city ?? recherche,
      startDate: enDateApi(dateDebut),
      endDate: enDateApi(dateFin),
      capacity: voyageurs > 0 ? voyageurs : filtres.capacity,
      category: filtres.category,
      bedrooms: filtres.bedrooms,
      homeType: filtres.homeType,
      amenities: filtres.amenities,
    });
  }

  const resumeQuand =
    dateDebut && dateFin
      ? `${formatDate(dateDebut)} – ${formatDate(dateFin)}`
      : dateDebut
        ? formatDate(dateDebut)
        : t('addDates');

  const resumeQui =
    voyageurs > 0 ? `${voyageurs} ${t('filters.travellers')}` : t('addTravelers');

  return (
    <SafeAreaView style={styles.page} edges={['top', 'left', 'right']}>
      <SearchFiltersSheet
        visible={filtresOuverts}
        valeurs={filtres}
        onFermer={() => setFiltresOuverts(false)}
        onAppliquer={(choix) => {
          setFiltres(choix);
          setFiltresOuverts(false);
        }}
      />

      <KeyboardAvoidingView style={styles.page} behavior="padding">
        <View style={styles.entete}>
          <BackButton onPress={() => navigation.goBack()} style={styles.boutonRond} />

          <Text style={styles.titrePage}>{t('search')}</Text>

          <TouchableOpacity
            style={styles.boutonRond}
            onPress={() => setFiltresOuverts(true)}
          >
            <SlidersHorizontal size={18} color={themeColors.text} />

            {compterFiltres(filtres) > 0 ? (
              <View style={styles.pastille}>
                <Text style={styles.pastilleTexte}>{compterFiltres(filtres)}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.contenu}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sectionOuverte === 'ou' ? (
            <View style={styles.carte}>
              <Text style={styles.titreCarte}>{t('where')}</Text>

              <View style={styles.champ}>
                <Search size={18} color={themeColors.textMuted} />

                <TextInput
                  value={saisie}
                  onChangeText={setSaisie}
                  placeholder={t('destinationPlaceholder')}
                  placeholderTextColor={themeColors.textMuted}
                  style={styles.champSaisie}
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.sousTitreSection}>
                {t('destinationSuggestions')}
              </Text>

              <LigneDestination
                titre={t('nearby')}
                sousTitre={t('nearbyHint')}
                icone={
                  cherchePosition ? (
                    <ActivityIndicator size="small" color={themeColors.info} />
                  ) : (
                    <Navigation size={20} color={themeColors.info} />
                  )
                }
                fondIcone={FOND_PROXIMITE}
                onPress={utiliserMaPosition}
              />

              {chercheUneVille ? (
                chercheProposition && propositions.length === 0 ? (
                  <ActivityIndicator style={styles.attente} />
                ) : propositions.length > 0 ? (
                  propositions.map((proposition) => (
                    <LigneDestination
                      key={proposition.id}
                      titre={proposition.name}
                      sousTitre={proposition.fullName}
                      ville={proposition.city}
                      pays={proposition.country}
                      onPress={() => choisirDestination(proposition)}
                    />
                  ))
                ) : (
                  <Text style={styles.vide}>{t('noDestination')}</Text>
                )
              ) : (
                <>
                  {recentes.map((recente) => (
                    <LigneDestination
                      key={recente.id}
                      titre={recente.fullName}
                      sousTitre={[
                        t('recentSearch'),
                        periode(recente.startDate, recente.endDate),
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                      ville={recente.city}
                      pays={recente.country}
                      onPress={() => choisirDestination(recente)}
                    />
                  ))}

                  {populaires.map((populaire) => (
                    <LigneDestination
                      key={populaire.id}
                      titre={populaire.fullName}
                      sousTitre={t('popularDestination')}
                      ville={populaire.city}
                      pays={populaire.country}
                      onPress={() => choisirDestination(populaire)}
                    />
                  ))}
                </>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.carteRepliee}
              onPress={() => setSectionOuverte('ou')}
              activeOpacity={0.7}
            >
              <Text style={styles.libelleReplie}>{t('where')}</Text>

              <Text style={styles.valeurRepliee} numberOfLines={1}>
                {destination?.fullName ?? t('addDestination')}
              </Text>
            </TouchableOpacity>
          )}

          {sectionOuverte === 'quand' ? (
            <View style={styles.carte}>
              <Text style={styles.titreCarte}>{t('when')}</Text>

              <View style={styles.rangeeDates}>
                <TouchableOpacity
                  style={styles.boutonDate}
                  onPress={() => setSelecteurOuvert('debut')}
                >
                  <Text style={dateDebut ? styles.dateChoisie : styles.datePlaceholder}>
                    {dateDebut ? formatDate(dateDebut) : t('startDate')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.boutonDate}
                  onPress={() => setSelecteurOuvert('fin')}
                >
                  <Text style={dateFin ? styles.dateChoisie : styles.datePlaceholder}>
                    {dateFin ? formatDate(dateFin) : t('endDate')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.carteRepliee}
              onPress={() => setSectionOuverte('quand')}
              activeOpacity={0.7}
            >
              <Text style={styles.libelleReplie}>{t('when')}</Text>
              <Text style={styles.valeurRepliee}>{resumeQuand}</Text>
            </TouchableOpacity>
          )}

          {sectionOuverte === 'qui' ? (
            <View style={styles.carte}>
              <Text style={styles.titreCarte}>{t('who')}</Text>

              <View style={styles.compteur}>
                <Text style={styles.compteurLibelle}>{t('filters.travellers')}</Text>

                <View style={styles.compteurBoutons}>
                  <TouchableOpacity
                    style={styles.boutonCompteur}
                    disabled={voyageurs === 0}
                    onPress={() => setVoyageurs((nombre) => Math.max(0, nombre - 1))}
                  >
                    <Minus
                      size={16}
                      color={voyageurs === 0 ? themeColors.textFaint : themeColors.text}
                    />
                  </TouchableOpacity>

                  <Text style={styles.compteurValeur}>{voyageurs}</Text>

                  <TouchableOpacity
                    style={styles.boutonCompteur}
                    onPress={() => setVoyageurs((nombre) => nombre + 1)}
                  >
                    <Plus size={16} color={themeColors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.carteRepliee}
              onPress={() => setSectionOuverte('qui')}
              activeOpacity={0.7}
            >
              <Text style={styles.libelleReplie}>{t('who')}</Text>
              <Text style={styles.valeurRepliee}>{resumeQui}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {selecteurOuvert === 'debut' ? (
          <SelecteurDeDate
            valeur={dateDebut ?? new Date()}
            minimum={new Date()}
            libelleFin={t('dateDone')}
            onChoisir={(choisie) => {
              if (choisie) setDateDebut(choisie);
            }}
            onFermer={() => setSelecteurOuvert(null)}
          />
        ) : null}

        {selecteurOuvert === 'fin' ? (
          <SelecteurDeDate
            valeur={dateFin ?? dateDebut ?? new Date()}
            minimum={dateDebut ?? new Date()}
            libelleFin={t('dateDone')}
            onChoisir={(choisie) => {
              if (choisie) setDateFin(choisie);
            }}
            onFermer={() => setSelecteurOuvert(null)}
          />
        ) : null}

        <View style={styles.barreBasse}>
          <TouchableOpacity onPress={toutEffacer}>
            <Text style={styles.toutEffacer}>{t('clearAll')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={lancerLaRecherche} activeOpacity={0.85}>
            <LinearGradient
              colors={[themeColors.accent, themeColors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.boutonRechercher}
            >
              <Search size={18} color="#FFFFFF" />

              <Text style={styles.boutonRechercherTexte}>{t('toSearch')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: c.screen,
    },

    entete: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },

    boutonRond: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },

    titrePage: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },

    pastille: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primary,
    },

    pastilleTexte: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    contenu: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: 12,
    },

    carte: {
      backgroundColor: c.surface,
      borderRadius: 24,
      padding: 20,
    },

    titreCarte: {
      fontSize: 22,
      fontWeight: '700',
      color: c.text,
      marginBottom: 16,
    },

    champ: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 52,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },

    champSaisie: {
      flex: 1,
      fontSize: 15,
      color: c.text,
    },

    sousTitreSection: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 20,
      marginBottom: 4,
    },

    attente: {
      marginVertical: 16,
    },

    vide: {
      fontSize: 14,
      color: c.textMuted,
      paddingVertical: 16,
    },

    carteRepliee: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      backgroundColor: c.surface,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 22,
    },

    libelleReplie: {
      fontSize: 15,
      color: c.textMuted,
    },

    valeurRepliee: {
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },

    rangeeDates: {
      flexDirection: 'row',
      gap: 12,
    },

    boutonDate: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    dateChoisie: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },

    datePlaceholder: {
      fontSize: 15,
      color: c.textMuted,
    },

    compteur: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    compteurLibelle: {
      fontSize: 15,
      color: c.text,
    },

    compteurBoutons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },

    boutonCompteur: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    compteurValeur: {
      minWidth: 20,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },

    barreBasse: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },

    toutEffacer: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
      textDecorationLine: 'underline',
    },

    boutonRechercher: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: 52,
      paddingHorizontal: 28,
      borderRadius: 26,
    },

    boutonRechercherTexte: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
