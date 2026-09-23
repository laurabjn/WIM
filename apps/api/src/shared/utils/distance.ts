const RAYON_TERRE_KM = 6371;
const KM_PAR_MILE = 1.609344;

export type UniteDeDistance = 'km' | 'mi';

export type Distance = { valeur: number; unite: UniteDeDistance };

function enRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

export function distanceEnKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const dLat = enRadians(latitude2 - latitude1);
  const dLon = enRadians(longitude2 - longitude1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(enRadians(latitude1)) *
      Math.cos(enRadians(latitude2)) *
      Math.sin(dLon / 2) ** 2;

  return RAYON_TERRE_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function exprimer(km: number, unite: UniteDeDistance): Distance {
  const valeur = unite === 'mi' ? km / KM_PAR_MILE : km;

  return { valeur: Math.round(valeur), unite };
}
