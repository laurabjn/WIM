import { Injectable } from '@nestjs/common';
import type { SupportedLocale, UserProfile } from '@wim/shared';
import type {
  ProfileRepository,
} from '../../application/profile/ports/profile.repository';
import { PrismaService } from '../database/prisma/prisma.service';
import { UpdateProfileInput } from 'src/application/profile/dto/update-my-profile.dto';
import { calculateAge } from 'src/shared/utils/calculated-age';

@Injectable()
export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    // Ces compteurs figuraient dans le contrat partagé et étaient affichés par
    // l'application, mais n'étaient jamais calculés : la fiche profil montrait
    // donc toujours 0.
    const [homesCount, exchangesCount, reviewStats] = await Promise.all([
      this.prisma.home.count({ where: { ownerId: userId } }),

      // L'utilisateur peut être hôte ou voyageur. Les échanges annulés ne
      // comptent pas : ils ne représentent aucun séjour réalisé ou à venir.
      this.prisma.exchange.count({
        where: {
          status: { not: 'CANCELLED' },
          OR: [{ hostId: userId }, { guestId: userId }],
        },
      }),

      // Les avis reçus portent sur les logements de l'utilisateur, pas sur
      // ceux qu'il a lui-même écrits.
      this.prisma.review.aggregate({
        where: { home: { ownerId: userId } },
        _count: { _all: true },
        _avg: { score: true },
      }),
    ]);

    return {
      ...this.mapUserToProfile(user),
      homesCount,
      exchangesCount,
      reviewsCount: reviewStats._count._all,
      averageRating: reviewStats._avg.score ?? null,
    };
  }

  async getPublicProfile(userId: string): Promise<Partial<UserProfile> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      age: calculateAge(user.birthDate),
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      country: user.country,
      nationality: user.nationality,
      phone: user.phone,
      birthDate: user.birthDate ? user.birthDate.toISOString() : null,
      languages: Array.isArray(user.languages)
        ? user.languages.filter((lang): lang is string => typeof lang === 'string')
        : [],
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        bio: input.bio,
        country: input.country,
        nationality: input.nationality,
        phone: input.phone,
        birthDate: input.birthDate,
        languages: input.languages,
        preferredLocale: input.preferredLocale,
        travelPreferences: input.travelPreferences,
      },
    });

    return this.mapUserToProfile(updatedUser);
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfile> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return this.mapUserToProfile(updatedUser);
  }

  private mapUserToProfile(user: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      age: calculateAge(user.birthDate),
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
      country: user.country ?? null,
      nationality: user.nationality ?? null,
      phone: user.phone ?? null,
      birthDate: user.birthDate ?? null,
      languages: Array.isArray(user.languages)
        ? user.languages
        : [],
      preferredLocale: (user.preferredLocale ?? 'fr') as SupportedLocale,
      travelPreferences: user.travelPreferences ?? {
        preferredCountries: [],
        preferredHomeTypes: [],
        minCapacity: null,
        maxCapacity: null,
        carExchangeAccepted: null,
        flexibleDates: null,
      },
    };
  }
}