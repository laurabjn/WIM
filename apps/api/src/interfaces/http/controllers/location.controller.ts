import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

type WikipediaPage = {
  pageid?: number;
  title?: string;
  extract?: string;
  description?: string;
  fullurl?: string;
  coordinates?: Array<{
    lat: number;
    lon: number;
  }>;
  // Présent uniquement sur les pages d'homonymie.
  pageprops?: {
    disambiguation?: string;
  };
};

type WikipediaQueryResponse = {
  query?: {
    pages?: Record<string, WikipediaPage>;
  };
};

@Controller('locations')
export class LocationController {
  @Get(':city/description')
  async getLocationDescription(
    @Param('city') city: string,
    @Query('language') language = 'fr',
    @Query('country') country?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
  ) {
    const normalizedCity = city.trim();

    if (!normalizedCity) {
      return null;
    }

    // L'article portant exactement le nom de la ville est presque toujours le
    // bon. On le tente en premier : la recherche par coordonnées renvoyait le
    // lieu le plus proche du point donné, donc un bâtiment ("Mairie de Lyon",
    // "Église Saint-Michel de Chamonix") plutôt que la ville elle-même.
    const resultFromTitle = await this.findDescriptionByTitle(
      normalizedCity,
      language,
    );

    if (resultFromTitle) {
      return resultFromTitle;
    }

    // Titre ambigu (« Valence » renvoie une page d'homonymie) : le pays permet
    // de trancher.
    const resultFromSearch = await this.findDescriptionBySearch(
      normalizedCity,
      language,
      country,
    );

    if (resultFromSearch) {
      return resultFromSearch;
    }

    // Dernier recours seulement, pour les lieux sans article dédié.
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (
      Number.isFinite(parsedLatitude) &&
      Number.isFinite(parsedLongitude)
    ) {
      return this.findDescriptionNearCoordinates({
        city: normalizedCity,
        language,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      });
    }

    return null;
  }

  private async findDescriptionByTitle(
    city: string,
    language: string,
  ) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: city,
      // Suit les redirections : « Chamonix » mène à « Chamonix-Mont-Blanc ».
      redirects: '1',
      prop: 'extracts|description|info|coordinates|pageprops',
      inprop: 'url',
      exintro: '1',
      explaintext: '1',
    });

    const data = await this.fetchWikipedia(language, params);
    const page = Object.values(data?.query?.pages ?? {})[0];

    // Une page d'homonymie n'a aucune valeur informative : on laisse la
    // recherche par pays trancher.
    if (page?.pageprops?.disambiguation !== undefined) {
      return null;
    }

    return this.mapWikipediaPage(page);
  }

  private async findDescriptionNearCoordinates({
    city,
    language,
    latitude,
    longitude,
  }: {
    city: string;
    language: string;
    latitude: number;
    longitude: number;
  }) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',

      generator: 'geosearch',
      ggscoord: `${latitude}|${longitude}`,
      ggsradius: '10000',
      ggslimit: '20',
      ggsnamespace: '0',

      prop: 'extracts|description|info|coordinates',
      inprop: 'url',
      exintro: '1',
      explaintext: '1',
    });

    const data = await this.fetchWikipedia(
      language,
      params,
    );

    const pages = Object.values(
      data?.query?.pages ?? {},
    );

    const selectedPage = this.selectBestPage(
      pages,
      city,
      latitude,
      longitude,
    );

    return this.mapWikipediaPage(selectedPage);
  }

  private async findDescriptionBySearch(
    city: string,
    language: string,
    country?: string,
  ) {
    const searchParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'search',
      // Le pays du logement, et non « Gironde France » comme auparavant : cette
      // valeur codée en dur faisait remonter « Sainte-Florence (Gironde) » pour
      // Florence, ou un département français pour Lyon.
      gsrsearch: country ? `${city} ${country}` : city,
      gsrlimit: '10',
      gsrnamespace: '0',

      prop: 'extracts|description|info|coordinates',
      inprop: 'url',
      exintro: '1',
      explaintext: '1',
    });

    const data = await this.fetchWikipedia(
      language,
      searchParams,
    );

    const pages = Object.values(
      data?.query?.pages ?? {},
    );

    const selectedPage =
      pages.find((page) =>
        this.normalize(page.title).includes(
          this.normalize(city),
        ),
      ) ?? pages[0];

    return this.mapWikipediaPage(selectedPage);
  }

  private selectBestPage(
    pages: WikipediaPage[],
    city: string,
    latitude: number,
    longitude: number,
  ): WikipediaPage | undefined {
    const normalizedCity = this.normalize(city);

    const scoredPages = pages.map((page) => {
      const normalizedTitle = this.normalize(
        page.title,
      );

      const normalizedDescription = this.normalize(
        page.description,
      );

      let score = 0;

      if (normalizedTitle === normalizedCity) {
        score += 100;
      }

      if (normalizedTitle.includes(normalizedCity)) {
        score += 60;
      }

      // Privilégie les articles décrivant une localité plutôt qu'un monument
      // ou une administration situés dans la ville.
      if (
        normalizedDescription.includes('commune') ||
        normalizedDescription.includes('ville') ||
        normalizedDescription.includes('cite') ||
        normalizedDescription.includes('localite')
      ) {
        score += 40;
      }

      if (
        normalizedDescription.includes('eglise') ||
        normalizedDescription.includes('musee') ||
        normalizedDescription.includes('gare') ||
        normalizedDescription.includes('administration')
      ) {
        score -= 100;
      }

      const coordinate = page.coordinates?.[0];

      if (coordinate) {
        const distance = this.getDistanceInKm(
          latitude,
          longitude,
          coordinate.lat,
          coordinate.lon,
        );
        score += Math.max(0, 50 - distance);
      }

      return {
        page,
        score,
      };
    });

    scoredPages.sort(
      (first, second) =>
        second.score - first.score,
    );

    return scoredPages[0]?.page;
  }

  private async fetchWikipedia(
    language: string,
    params: URLSearchParams,
  ): Promise<WikipediaQueryResponse | null> {
    const response = await fetch(
      `https://${language}.wikipedia.org/w/api.php?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'WIM/1.0 (https://wim-app.fr; contact@wim-app.fr)',
        },
      },
    );

    if (!response.ok) {
      const body = await response.text();

      console.error('Wikipedia error', {
        status: response.status,
        body,
      });

      return null;
    }

    return response.json() as Promise<WikipediaQueryResponse>;
  }

  private mapWikipediaPage(
    page?: WikipediaPage,
  ) {
    if (!page?.extract) {
      return null;
    }

    return {
      title: page.title ?? '',
      description: page.description ?? '',
      extract: page.extract,
      pageUrl: page.fullurl,
    };
  }

  private normalize(
    value?: string,
  ): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private getDistanceInKm(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
  ): number {
    const earthRadius = 6371;

    const latitudeDifference =
      this.toRadians(latitude2 - latitude1);

    const longitudeDifference =
      this.toRadians(longitude2 - longitude1);

    const a =
      Math.sin(latitudeDifference / 2) ** 2 +
      Math.cos(this.toRadians(latitude1)) *
        Math.cos(this.toRadians(latitude2)) *
        Math.sin(longitudeDifference / 2) ** 2;

    return (
      2 *
      earthRadius *
      Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    );
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}