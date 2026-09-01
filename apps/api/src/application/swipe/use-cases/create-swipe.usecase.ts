import {
  CreateSwipeInput,
  SwipeRepository,
} from 'src/domain/auth/repositories/swipe.repository';

export class CreateSwipeUseCase {
  constructor(
    private readonly swipeRepository:
      SwipeRepository,
  ) {}

  async execute(
    input: CreateSwipeInput,
  ) {
    if (
      input.swiperId ===
      input.targetUserId
    ) {
      throw new Error(
        'Vous ne pouvez pas vous swiper vous-même',
      );
    }

    const homeBelongsToTarget =
      await this.swipeRepository.homeBelongsToUser(
        input.homeId,
        input.targetUserId,
      );

    if (!homeBelongsToTarget) {
      throw new Error(
        'Le logement ne correspond pas à cet utilisateur',
      );
    }

    const swipe =
      await this.swipeRepository.create(
        input,
      );

    if (
      input.direction ===
      'DISLIKE'
    ) {
      return {
        success: true,
        swipeId: swipe.id,
        match: false,
        matchId: null,
      };
    }

    const logementsLikes =
      await this.swipeRepository.likedHomeIds(
        input.swiperId,
        input.targetUserId,
      );

    const dejaMatche =
      await this.swipeRepository.hasMatch(
        input.swiperId,
        input.targetUserId,
      );

    const autreLogementDejaLike =
      dejaMatche && logementsLikes.length > 1;

    const alreadyTalking =
      await this.swipeRepository.hasOpenConversation(
        input.swiperId,
        input.targetUserId,
      );

    if (alreadyTalking) {
      return {
        success: true,
        swipeId: swipe.id,
        match: false,
        matchId: null,
        autreLogementDejaLike,
      };
    }

    const reciprocalLike =
      await this.swipeRepository.hasLike(
        input.targetUserId,
        input.swiperId,
      );

    if (!reciprocalLike) {
      return {
        success: true,
        swipeId: swipe.id,
        match: false,
        matchId: null,
        autreLogementDejaLike,
      };
    }

    const match =
      await this.swipeRepository.createMatch(
        input.swiperId,
        input.targetUserId,
      );

    return {
      success: true,
      swipeId: swipe.id,
      match: true,
      matchId: match.id,
      chatId: match.chat.id,
      autreLogementDejaLike,
    };
  }
}