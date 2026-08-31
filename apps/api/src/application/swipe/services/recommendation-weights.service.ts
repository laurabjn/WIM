import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

export type PoidsRecommandation = {
  rechercheVille: number;
  recherchePays: number;
  distanceProche: number;
  distanceMoyenne: number;
  distanceLointaine: number;
  plafondRecherche: number;
  typeAime: number;
  equipementAime: number;
  plafondEquipements: number;
  plafondPreferences: number;
  villeRejetee: number;
  typeRejete: number;
  equipementRejete: number;
  plafondEquipementsRejetes: number;
  plafondRejet: number;
};

export const POIDS_PAR_DEFAUT: PoidsRecommandation = {
  rechercheVille: 15,
  recherchePays: 5,
  distanceProche: 10,
  distanceMoyenne: 7,
  distanceLointaine: 3,
  plafondRecherche: 25,
  typeAime: 15,
  equipementAime: 5,
  plafondEquipements: 15,
  plafondPreferences: 30,
  villeRejetee: 10,
  typeRejete: 20,
  equipementRejete: 3,
  plafondEquipementsRejetes: 10,
  plafondRejet: 40,
};

const CLE = 'recommandation';
const DUREE_CACHE_MS = 60_000;

@Injectable()
export class RecommendationWeightsService {
  private readonly logger = new Logger(RecommendationWeightsService.name);

  private cache: { valeurs: PoidsRecommandation; expire: number } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  // Le scoreur classe chaque logement a chaque carte : relire la table a
  // chaque appel couterait plus que le reglage ne rapporte.
  async valeurs(): Promise<PoidsRecommandation> {
    if (this.cache && this.cache.expire > Date.now()) {
      return this.cache.valeurs;
    }

    const valeurs = await this.lire();

    this.cache = { valeurs, expire: Date.now() + DUREE_CACHE_MS };

    return valeurs;
  }

  async remplacer(
    modifications: Partial<PoidsRecommandation>,
  ): Promise<PoidsRecommandation> {
    const valeurs = { ...(await this.lire()), ...this.nettoyer(modifications) };

    await this.prisma.appSetting.upsert({
      where: { key: CLE },
      update: { value: valeurs as object },
      create: { key: CLE, value: valeurs as object },
    });

    this.cache = null;

    return valeurs;
  }

  private async lire(): Promise<PoidsRecommandation> {
    try {
      const ligne = await this.prisma.appSetting.findUnique({
        where: { key: CLE },
      });

      if (!ligne) return POIDS_PAR_DEFAUT;

      return {
        ...POIDS_PAR_DEFAUT,
        ...this.nettoyer(ligne.value as Partial<PoidsRecommandation>),
      };
    } catch (error) {
      this.logger.warn(
        `Ponderations illisibles, valeurs par defaut : ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return POIDS_PAR_DEFAUT;
    }
  }

  // Une ponderation negative ou absurde renverserait le classement sans que
  // personne ne comprenne pourquoi : on ne garde que des nombres tenables.
  private nettoyer(
    modifications: Partial<PoidsRecommandation>,
  ): Partial<PoidsRecommandation> {
    const propre: Partial<PoidsRecommandation> = {};

    for (const cle of Object.keys(POIDS_PAR_DEFAUT) as Array<
      keyof PoidsRecommandation
    >) {
      const valeur = modifications?.[cle];

      if (typeof valeur !== 'number' || !Number.isFinite(valeur)) continue;

      propre[cle] = Math.max(0, Math.min(100, Math.round(valeur)));
    }

    return propre;
  }
}
