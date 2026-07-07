import {
  CreateSwipeInput,
  SwipeRepository
} from "src/domain/auth/repositories/swipe.repository";

export class CreateSwipeUseCase {
  constructor(private readonly swipeRepository: SwipeRepository) {}

  async execute(input: CreateSwipeInput) {
    if (input.swiperId === input.targetUserId) {
      throw new Error('Vous ne pouvez pas vous swiper vous-même');
    }

    await this.swipeRepository.create(input);

    if (input.direction === 'DISLIKE') {
      return {
        success: true,
        match: false,
        matchId: null,
      };
    }

    const reciprocalLike = await this.swipeRepository.hasLike(
      input.targetUserId,
      input.swiperId,
    );

    if (!reciprocalLike) {
      return {
        success: true,
        match: false,
        matchId: null,
      };
    }

    const match = await this.swipeRepository.createMatch(
      input.swiperId,
      input.targetUserId,
    );

    return {
      success: true,
      match: true,
      matchId: match.id,
    };
  }
}