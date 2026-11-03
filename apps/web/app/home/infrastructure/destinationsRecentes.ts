const CLE = 'wim.recent-destinations.web';
const MAX = 3;

export function lireDestinationsRecentes(): string[] {
  try {
    const brut = localStorage.getItem(CLE);

    if (!brut) return [];

    const lu: unknown = JSON.parse(brut);

    return Array.isArray(lu)
      ? lu.filter((nom): nom is string => typeof nom === 'string')
      : [];
  } catch {
    return [];
  }
}

export function retenirDestination(nom: string): void {
  const propre = nom.trim();

  if (!propre) return;

  try {
    const suivantes = [
      propre,
      ...lireDestinationsRecentes().filter((autre) => autre !== propre),
    ].slice(0, MAX);

    localStorage.setItem(CLE, JSON.stringify(suivantes));
  } catch {
    return;
  }
}
