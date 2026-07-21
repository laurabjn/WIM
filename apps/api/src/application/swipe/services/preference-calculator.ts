import { Prisma } from "@prisma/client";
import { WeightedPreference } from "src/domain/auth/entities/recommendation.entity";

export function normalizeValue(
  value?: string | null,
): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function calculateWeightedPreferences(
  values: Array<string | null | undefined>,
): WeightedPreference[] {
  const normalizedValues = values
    .map(normalizeValue)
    .filter(Boolean);

  if (normalizedValues.length === 0) {
    return [];
  }

  const counts = new Map<string, number>();

  for (const value of normalizedValues) {
    counts.set(
      value,
      (counts.get(value) ?? 0) + 1,
    );
  }

  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      weight: count / normalizedValues.length,
    }))
    .sort(
      (first, second) =>
        second.weight - first.weight,
    );
}

export function calculateAverage(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0,
  );

  return total / values.length;
}

export function flattenAmenities(
  homes: Array<{
    amenities: Prisma.JsonValue;
  }>,
): string[] {
  return homes.flatMap((home) => {
    if (Array.isArray(home.amenities)) {
      return home.amenities.filter(
        (value): value is string =>
          typeof value === 'string',
      );
    }

    return [];
  });
}