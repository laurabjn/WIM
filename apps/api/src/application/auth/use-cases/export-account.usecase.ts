import { Logger, NotFoundException } from '@nestjs/common';

import type { EmailSenderPort } from 'src/application/notifications/ports/email-sender.port';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { buildAccountExportEmail } from 'src/shared/utils/account-export.template';

export class ExportAccountUseCase {
  private readonly logger = new Logger(ExportAccountUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailSender: EmailSenderPort,
  ) {}

  async execute(userId: string): Promise<void> {
    const compte = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        homes: {
          include: {
            photos: { select: { url: true, position: true } },
            availabilities: true,
          },
        },
        favorites: { include: { home: { select: { title: true, city: true } } } },
        searchHistory: true,
        swipesMade: {
          include: { home: { select: { title: true, city: true } } },
        },
        reviews: {
          include: { home: { select: { title: true, city: true } } },
        },
        messages: { select: { chatId: true, content: true, type: true, createdAt: true } },
        subscription: true,
        referralsMade: true,
        referralReceived: true,
      },
    });

    if (!compte) {
      throw new NotFoundException('Compte introuvable.');
    }

    const dossier = {
      genereLe: new Date().toISOString(),
      compte: {
        id: compte.id,
        email: compte.email,
        prenom: compte.firstName,
        nom: compte.lastName,
        dateDeNaissance: compte.birthDate,
        nationalite: compte.nationality,
        pays: compte.country,
        telephone: compte.phone,
        langues: compte.languages,
        biographie: compte.bio,
        photo: compte.avatarUrl,
        identiteVerifiee: compte.identityStatus === 'VERIFIED',
        inscritLe: compte.createdAt,
        reglages: {
          profilVisible: compte.profileVisible,
          afficherMonAge: compte.showAge,
          localisationPrecise: compte.showPreciseLocation,
          partageDeDonnees: compte.dataSharing,
          messagesAutorises: compte.allowMessages,
          devise: compte.currency,
          uniteDeDistance: compte.distanceUnit,
          langue: compte.preferredLocale,
        },
      },
      logements: compte.homes.map((logement) => ({
        titre: logement.title,
        description: logement.description,
        ville: logement.city,
        pays: logement.country,
        adresse: logement.address,
        coordonnees:
          logement.latitude !== null && logement.longitude !== null
            ? { latitude: logement.latitude, longitude: logement.longitude }
            : null,
        capacite: logement.capacity,
        chambres: logement.bedrooms,
        lits: logement.beds,
        sallesDeBain: logement.bathrooms,
        type: logement.homeType,
        equipements: logement.amenities,
        photos: logement.photos,
        disponibilites: logement.availabilities,
        publieLe: logement.createdAt,
      })),
      favoris: compte.favorites.map((favori) => ({
        logement: favori.home.title,
        ville: favori.home.city,
        ajouteLe: favori.createdAt,
      })),
      recherches: compte.searchHistory.map((recherche) => ({
        ville: recherche.city,
        pays: recherche.country,
        voyageurs: recherche.capacity,
        du: recherche.startDate,
        au: recherche.endDate,
        faiteLe: recherche.createdAt,
      })),
      logementsTries: compte.swipesMade.map((swipe) => ({
        logement: swipe.home.title,
        ville: swipe.home.city,
        geste: swipe.direction,
        faitLe: swipe.createdAt,
      })),
      avisLaisses: compte.reviews.map((avis) => ({
        logement: avis.home.title,
        ville: avis.home.city,
        note: avis.score,
        commentaire: avis.comment,
        laisseLe: avis.createdAt,
      })),
      messagesEnvoyes: compte.messages.map((message) => ({
        conversation: message.chatId,
        type: message.type,
        contenu: message.content,
        envoyeLe: message.createdAt,
      })),
      abonnement: compte.subscription
        ? {
            formule: compte.subscription.plan,
            statut: compte.subscription.status,
            debut: compte.subscription.startedAt,
            finDePeriode: compte.subscription.currentPeriodEnd,
            resilieLe: compte.subscription.cancelledAt,
          }
        : null,
      parrainage: {
        monCode: compte.referralCode,
        filleuls: compte.referralsMade.map((parrainage) => ({
          recompenseLe: parrainage.rewardedAt,
          creeLe: parrainage.createdAt,
        })),
        parraineLe: compte.referralReceived?.createdAt ?? null,
      },
    };

    const contenu = JSON.stringify(dossier, null, 2);
    const jour = new Date().toISOString().slice(0, 10);

    const { subject, html, text } = buildAccountExportEmail(
      compte.preferredLocale,
      compte.firstName,
    );

    try {
      await this.emailSender.send({
        to: compte.email,
        subject,
        html,
        text,
        piecesJointes: [
          {
            nom: `wim-mes-donnees-${jour}.json`,
            contenu,
            type: 'application/json',
          },
        ],
      });
    } catch (erreur: unknown) {
      this.logger.error(`Export non envoye a ${userId} : ${erreur}`);

      throw erreur;
    }
  }
}
