export const JETON_MAPBOX = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export const carteEstConfiguree = JETON_MAPBOX.length > 0;

const RAYON_KM = 5;
const POINTS = 64;

/* Le même cercle approché que l'app : cinq kilomètres autour des
   coordonnées, pour ne jamais exposer l'adresse exacte. */
export function anneauApproche(
  longitude: number,
  latitude: number,
): [number, number][] {
  const parKmEnLongitude = 1 / (111.32 * Math.cos((latitude * Math.PI) / 180));
  const parKmEnLatitude = 1 / 110.574;

  const points: [number, number][] = [];

  for (let pas = 0; pas < POINTS; pas += 1) {
    const angle = (pas / POINTS) * 2 * Math.PI;

    points.push([
      longitude + RAYON_KM * parKmEnLongitude * Math.cos(angle),
      latitude + RAYON_KM * parKmEnLatitude * Math.sin(angle),
    ]);
  }

  const premier = points[0];

  if (premier) points.push(premier);

  return points;
}
