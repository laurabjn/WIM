import { swipeHomesMock } from "./mocks/swipeHomeMocks";
import { RecommendationScenarioName, recommendationScenarios } from "./mocks/swipeRecommendationScenarioMock";
import { SwipeMockRecommendationEngine } from "./swipeRecommendationEngine";

const engine =
  new SwipeMockRecommendationEngine();

export function debugSwipeRecommendation(
  scenarioName:
    RecommendationScenarioName,
) {
  const user =
    recommendationScenarios[
      scenarioName
    ];

  const profile =
    engine.buildProfile(
      user,
      swipeHomesMock,
    );

  const recommendations =
    engine.recommend(
      user,
      swipeHomesMock,
      {
        excludeAlreadySwiped: true,
        includeDiscovery: false,
        limit: 20,
      },
    );

  console.log(
    `SCÉNARIO : ${scenarioName}`,
  );

  console.log(
    'VILLES PRÉFÉRÉES :',
    profile.preferredCities,
  );

  console.log(
    'TYPES PRÉFÉRÉS :',
    profile.preferredHomeTypes,
  );

  console.log(
    'ÉQUIPEMENTS PRÉFÉRÉS :',
    profile.preferredAmenities.slice(
      0,
      10,
    ),
  );

  console.table(
    recommendations.map(
      (home, index) => ({
        position: index + 1,
        id: home.id,
        title: home.title,
        city: home.city,
        type: home.homeType,
        beds: home.beds,
        price: home.pricePerNight,
        score:
          home.recommendationScore,

        cityScore:
          home
            .recommendationDetails
            .cityScore,

        typeScore:
          home
            .recommendationDetails
            .homeTypeScore,

        amenityScore:
          home
            .recommendationDetails
            .amenitiesScore,

        searchScore:
          home
            .recommendationDetails
            .searchScore,

        penalty:
          home
            .recommendationDetails
            .dislikePenalty,
      }),
    ),
  );

  return recommendations;
}