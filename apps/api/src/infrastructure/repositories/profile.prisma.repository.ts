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

    return this.mapUserToProfile(user);
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