import { Home } from '@wim/shared/home/home.type';

export type SwipeStackParamList = {
  Swipe: 
    | {
        processedHomeId?: string;
        action?: 'like' | 'dislike';
      }
    | undefined;

  SwipeHomeDetails: {
    home: Home;
  };
};