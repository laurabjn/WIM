import { Injectable } from '@nestjs/common';
import type { SupportedLocale, UserProfile } from '@wim/shared';
import type {
  ProfileRepository,
} from '../../application/profile/ports/profile.repository';
import { PrismaService } from '../database/prisma/prisma.service';
import { UpdateProfileInput } from 'src/application/profile/dto/update-my-profile.dto';
import { calculateAge } from 'src/shared/utils/calculated-age';
import { currentStatus } from 'src/application/profile/status';

@Injectable()
export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    const [homesCount, exchangesCount, reviewStats] = await Promise.all([
      this.prisma.home.count({ where: { ownerId: userId } }),

      this.prisma.exchange.count({
        where: {
          status: { not: 'CANCELLED' },
          OR: [{ hostId: userId }, { guestId: userId }],
        },
      }),

      this.prisma.review.aggregate({
        where: { home: { ownerId: userId } },
        _count: { _all: true },
        _avg: { score: true },
      }),
    ]);

    return {
      ...this.mapUserToProfile(user),
      profileVisible: user.profileVisible,
      showAge: user.showAge,
      dataSharing: user.dataSharing,
      notifyNewMessages: user.notifyNewMessages,
      notifyPush: user.notifyPush,
      notifyExchanges: user.notifyExchanges,
      notifySms: user.notifySms,
      marketingEmails: user.marketingEmails,
      showPreciseLocation: user.showPreciseLocation,
      allowMessages: user.allowMessages,
      distanceUnit: user.distanceUnit === 'mi' ? 'mi' : 'km',
      homesCount,
      exchangesCount,
      reviewsCount: reviewStats._count._all,
      averageRating:
        reviewStats._avg.score !== null
          ? Math.round(reviewStats._avg.score * 10) / 10
          : null,
    };
  }

  async getPublicProfile(userId: string): Promise<Partial<UserProfile> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    const [homesCount, exchangesCount, reviewStats] = await Promise.all([
      this.prisma.home.count({ where: { ownerId: userId } }),
      this.prisma.exchange.count({
        where: {
          status: { not: 'CANCELLED' },
          OR: [{ hostId: userId }, { guestId: userId }],
        },
      }),
      this.prisma.review.aggregate({
        where: { home: { ownerId: userId } },
        _count: { _all: true },
        _avg: { score: true },
      }),
    ]);

    const masque = !user.profileVisible;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.showAge ? calculateAge(user.birthDate) : null,
      homesCount,
      exchangesCount,
      reviewsCount: reviewStats._count._all,
      averageRating:
        reviewStats._avg.score !== null
          ? Math.round(reviewStats._avg.score * 10) / 10
          : null,
      avatarUrl: user.avatarUrl,
      bio: masque ? null : user.bio,
      country: masque ? null : user.country,
      nationality: masque ? null : user.nationality,
      phone: null,
      birthDate: user.showAge && !masque && user.birthDate
        ? user.birthDate.toISOString()
        : null,
      languages: masque
        ? []
        : Array.isArray(user.languages)
          ? user.languages.filter(
              (lang): lang is string => typeof lang === 'string',
            )
          : [],
      profileVisible: user.profileVisible,
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
        profileVisible: input.profileVisible,
        showAge: input.showAge,
        dataSharing: input.dataSharing,
        notifyNewMessages: input.notifyNewMessages,
        notifyPush: input.notifyPush,
        notifyExchanges: input.notifyExchanges,
        notifySms: input.notifySms,
        marketingEmails: input.marketingEmails,
        showPreciseLocation: input.showPreciseLocation,
        allowMessages: input.allowMessages,
        distanceUnit: input.distanceUnit,
        ...(input.statusText === undefined
          ? {}
          : {
              statusText: input.statusText?.trim() ? input.statusText.trim() : null,
              statusUpdatedAt: input.statusText?.trim() ? new Date() : null,
            }),
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
      status: currentStatus(user.statusText, user.statusUpdatedAt),
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