import { swipeLikesMock } from './mocks/swipeLikesMock';
import { swipeFavoritesMock } from './mocks/swipeFavoritesMock';
import { swipeDislikesMock } from './mocks/swipeDislikesMock';
import { swipeSearchHistoryMock } from './mocks/swipeSearchHistoryMock';
import { swipeHomesMock } from './mocks/swipeHomeMocks';

export class SwipeRecommendationRepository {

    getHomes() {
        return swipeHomesMock;
    }

    getLikes() {
        return swipeLikesMock;
    }

    getFavorites() {
        return swipeFavoritesMock;
    }

    getDislikes() {
        return swipeDislikesMock;
    }

    getSearchHistory() {
        return swipeSearchHistoryMock;
    }

}