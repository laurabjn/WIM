import { WeightedPreference } from "@wim/shared/swipe/swipeRecommendation.types";

export function normalizePreference(
  value?: string | null,
): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function calculateWeightedPreferences(
  values: Array<{
    value?: string | null;
    importance?: number;
  }>,
): WeightedPreference[] {
  const counts = new Map<
    string,
    {
      occurrences: number;
      weightedCount: number;
    }
  >();

  let totalWeight = 0;

  for (const item of values) {
    const normalizedValue =
      normalizePreference(item.value);

    if (!normalizedValue) {
      continue;
    }

    const importance =
      item.importance ?? 1;

    const current = counts.get(
      normalizedValue,
    ) ?? {
      occurrences: 0,
      weightedCount: 0,
    };

    counts.set(normalizedValue, {
      occurrences:
        current.occurrences + 1,
      weightedCount:
        current.weightedCount + importance,
    });

    totalWeight += importance;
  }

  if (totalWeight === 0) {
    return [];
  }

  return [...counts.entries()]
    .map(
      ([
        value,
        {
          occurrences,
          weightedCount,
        },
      ]) => ({
        value,
        occurrences,
        weight:
          weightedCount / totalWeight,
      }),
    )
    .sort(
      (first, second) =>
        second.weight - first.weight,
    );
}

export function calculateAverage(
  values: Array<{
    value: number;
    importance?: number;
  }>,
): number | null {
  if (values.length === 0) {
    return null;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const item of values) {
    const importance =
      item.importance ?? 1;

    weightedSum +=
      item.value * importance;

    totalWeight += importance;
  }

  if (totalWeight === 0) {
    return null;
  }

  return weightedSum / totalWeight;
}