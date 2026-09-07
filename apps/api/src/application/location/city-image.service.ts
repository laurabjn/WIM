import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

export type ImageDeVille = { id: string; url: string; grande: string };

const MAXIMUM = 3;
const FRAICHEUR_MS = 30 * 24 * 60 * 60 * 1000;
const FRAICHEUR_SANS_RESULTAT_MS = 24 * 60 * 60 * 1000;
const DELAI_MAXIMUM_MS = 8000;

type PhotoUnsplash = {
  id?: string;
  urls?: { small?: string; regular?: string };
};

@Injectable()
export class CityImageService {
  private readonly logger = new Logger(CityImageService.name);

  private readonly enCours = new Map<string, Promise<ImageDeVille[] | null>>();

  constructor(private readonly prisma: PrismaService) {}

  async pourVille(
    ville: string,
    pays: string,
    nombre = MAXIMUM,
  ): Promise<ImageDeVille[]> {
    const city = this.normaliser(ville);
    const country = this.normaliser(pays);

    if (!city) return [];

    const enregistrement = await this.prisma.cityImage.findUnique({
      where: { city_country: { city, country } },
    });

    if (enregistrement && this.estFraiche(enregistrement)) {
      return this.limiter(enregistrement.images, nombre);
    }

    const trouvees = await this.telechargerUneSeuleFois(
      `${city}|${country}`,
      ville,
      pays,
    );

    if (trouvees === null) {
      return this.limiter(enregistrement?.images ?? [], nombre);
    }

    await this.prisma.cityImage
      .upsert({
        where: { city_country: { city, country } },
        create: { city, country, images: trouvees, fetchedAt: new Date() },
        update: { images: trouvees, fetchedAt: new Date() },
      })
      .catch((erreur: unknown) => {
        this.logger.warn(`Mise en cache impossible pour ${city} : ${erreur}`);
      });

    return this.limiter(trouvees, nombre);
  }

  private telechargerUneSeuleFois(
    cle: string,
    ville: string,
    pays: string,
  ): Promise<ImageDeVille[] | null> {
    const enVol = this.enCours.get(cle);

    if (enVol) return enVol;

    const promesse = this.telecharger(ville, pays).finally(() => {
      this.enCours.delete(cle);
    });

    this.enCours.set(cle, promesse);

    return promesse;
  }

  private async telecharger(
    ville: string,
    pays: string,
  ): Promise<ImageDeVille[] | null> {
    const cle = process.env.UNSPLASH_ACCESS_KEY;

    if (!cle) {
      this.logger.warn(
        'UNSPLASH_ACCESS_KEY absent : aucune image de ville ne sera servie.',
      );

      return null;
    }

    const parVille = await this.interroger(`${ville} travel`, cle);

    if (parVille === null) return null;
    if (parVille.length > 0) return parVille;
    if (!pays.trim()) return [];

    return (await this.interroger(pays, cle)) ?? [];
  }

  private async interroger(
    requete: string,
    cle: string,
  ): Promise<ImageDeVille[] | null> {
    const adresse =
      'https://api.unsplash.com/search/photos' +
      `?query=${encodeURIComponent(requete)}` +
      `&per_page=${MAXIMUM}&orientation=landscape`;

    try {
      const reponse = await fetch(adresse, {
        headers: { Authorization: `Client-ID ${cle}` },
        signal: AbortSignal.timeout(DELAI_MAXIMUM_MS),
      });

      if (!reponse.ok) {
        this.logger.warn(
          `Unsplash a repondu ${reponse.status} pour "${requete}".`,
        );

        return null;
      }

      const donnees = (await reponse.json()) as { results?: PhotoUnsplash[] };

      return (donnees.results ?? [])
        .filter(
          (photo) =>
            Boolean(photo?.id) &&
            Boolean(photo?.urls?.small) &&
            Boolean(photo?.urls?.regular),
        )
        .map((photo) => ({
          id: photo.id as string,
          url: photo.urls?.small as string,
          grande: photo.urls?.regular as string,
        }));
    } catch (erreur: unknown) {
      this.logger.warn(`Unsplash injoignable pour "${requete}" : ${erreur}`);

      return null;
    }
  }

  private estFraiche(enregistrement: {
    images: unknown;
    fetchedAt: Date;
  }): boolean {
    const garde =
      Array.isArray(enregistrement.images) && enregistrement.images.length > 0
        ? FRAICHEUR_MS
        : FRAICHEUR_SANS_RESULTAT_MS;

    return Date.now() - enregistrement.fetchedAt.getTime() < garde;
  }

  private limiter(images: unknown, nombre: number): ImageDeVille[] {
    if (!Array.isArray(images)) return [];

    const demandees = Math.min(Math.max(1, Math.trunc(nombre)), MAXIMUM);

    return images
      .filter(
        (image): image is ImageDeVille =>
          typeof image === 'object' &&
          image !== null &&
          typeof (image as ImageDeVille).url === 'string' &&
          typeof (image as ImageDeVille).grande === 'string',
      )
      .slice(0, demandees);
  }

  private normaliser(valeur: string): string {
    return (valeur ?? '').trim().toLowerCase();
  }
}
