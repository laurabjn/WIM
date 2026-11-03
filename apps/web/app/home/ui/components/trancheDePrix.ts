const SEUIL_MOYEN = 80;
const SEUIL_ELEVE = 150;

export function trancheDePrix(prixParNuit: number | null | undefined) {
  if (!prixParNuit) return '';

  if (prixParNuit < SEUIL_MOYEN) return '€';

  return prixParNuit < SEUIL_ELEVE ? '€€' : '€€€';
}
