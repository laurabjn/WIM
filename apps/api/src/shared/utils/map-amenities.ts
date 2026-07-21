import { Prisma } from "@prisma/client";

export function mapAmenities(
  value: Prisma.JsonValue,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === 'string',
  );
}