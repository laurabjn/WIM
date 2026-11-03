import { getSession } from 'src/auth/infrastructure/authStorage';
import { searchHomesApi } from 'src/home/infrastructure/searchHome.api';
import type { DestinationSuggestion } from './mapboxSearch.api';

const MAX_POPULAIRES = 3;

type Comptage = { ville: string; pays: string; nombre: number };

export async function getDestinationsPopulaires(): Promise<DestinationSuggestion[]> {
  try {
    const session = await getSession();

    if (!session?.accessToken) return [];

    const logements = await searchHomesApi(session.accessToken, {});
    const parVille = new Map<string, Comptage>();

    for (const logement of logements) {
      if (!logement.city) continue;

      const pays = logement.country ?? '';
      const cle = `${logement.city}|${pays}`;
      const connu = parVille.get(cle);

      if (connu) {
        connu.nombre += 1;
        continue;
      }

      parVille.set(cle, { ville: logement.city, pays, nombre: 1 });
    }

    return Array.from(parVille.values())
      .sort((a, b) => b.nombre - a.nombre)
      .slice(0, MAX_POPULAIRES)
      .map(({ ville, pays }) => ({
        id: `populaire-${ville}-${pays}`,
        name: ville,
        fullName: [ville, pays].filter(Boolean).join(', '),
        city: ville,
        country: pays,
        longitude: 0,
        latitude: 0,
      }));
  } catch {
    return [];
  }
}
