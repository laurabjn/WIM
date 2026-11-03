import Image from 'next/image';

import styles from './CarteLogement.module.css';

const JETON = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const RAYON_KM = 5;
const POINTS = 48;
const LARGEUR = 1000;
const HAUTEUR = 420;

export const carteEstConfiguree = JETON.length > 0;

function anneauApproche(longitude: number, latitude: number) {
  const parKmEnLongitude = 1 / (111.32 * Math.cos((latitude * Math.PI) / 180));
  const parKmEnLatitude = 1 / 110.574;

  const points: [number, number][] = [];

  for (let pas = 0; pas < POINTS; pas += 1) {
    const angle = (pas / POINTS) * 2 * Math.PI;

    points.push([
      Number((longitude + RAYON_KM * parKmEnLongitude * Math.cos(angle)).toFixed(5)),
      Number((latitude + RAYON_KM * parKmEnLatitude * Math.sin(angle)).toFixed(5)),
    ]);
  }

  const premier = points[0];

  if (premier) points.push(premier);

  return points;
}

type Props = {
  latitude: number;
  longitude: number;
  legende: string;
};

export function CarteLogement({ latitude, longitude, legende }: Props) {
  if (!carteEstConfiguree) return null;

  const zone = {
    type: 'Feature',
    properties: {
      fill: '#087ebe',
      'fill-opacity': 0.14,
      stroke: '#087ebe',
      'stroke-width': 2,
      'stroke-opacity': 0.9,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [anneauApproche(longitude, latitude)],
    },
  };

  const calque = encodeURIComponent(JSON.stringify(zone));

  const source =
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static` +
    `/geojson(${calque})` +
    `/auto` +
    `/${LARGEUR}x${HAUTEUR}@2x` +
    `?access_token=${JETON}&logo=false&padding=48`;

  return (
    <div className={styles.carte}>
      <Image
        src={source}
        alt={legende}
        width={LARGEUR}
        height={HAUTEUR}
        unoptimized
      />
    </div>
  );
}
