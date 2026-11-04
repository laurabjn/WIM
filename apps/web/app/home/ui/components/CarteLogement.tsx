'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

import { JETON_MAPBOX, anneauApproche } from 'app/home/infrastructure/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './CarteLogement.module.css';

const BLEU = '#087ebe';

type Props = {
  latitude: number;
  longitude: number;
  legende: string;
};

export function CarteLogement({ latitude, longitude, legende }: Props) {
  const contenant = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contenant.current || !JETON_MAPBOX) return;

    mapboxgl.accessToken = JETON_MAPBOX;

    const anneau = anneauApproche(longitude, latitude);
    const premier = anneau[0];

    if (!premier) return;

    const carte = new mapboxgl.Map({
      container: contenant.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 11,
    });

    carte.addControl(new mapboxgl.NavigationControl(), 'top-right');

    carte.on('load', () => {
      carte.addSource('zone', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [anneau] },
        },
      });

      carte.addLayer({
        id: 'zoneFond',
        type: 'fill',
        source: 'zone',
        paint: { 'fill-color': BLEU, 'fill-opacity': 0.14 },
      });

      carte.addLayer({
        id: 'zoneContour',
        type: 'line',
        source: 'zone',
        paint: { 'line-color': BLEU, 'line-width': 2 },
      });

      const cadre = anneau.reduce(
        (limites, point) => limites.extend(point),
        new mapboxgl.LngLatBounds(premier, premier),
      );

      carte.fitBounds(cadre, { padding: 48, duration: 0 });
    });

    return () => carte.remove();
  }, [latitude, longitude]);

  return (
    <div
      className={styles.carte}
      ref={contenant}
      role="application"
      aria-label={legende}
    />
  );
}
