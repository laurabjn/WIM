import type { StackNavigationOptions } from '@react-navigation/stack';

const DUREE_MS = 220;

const SPEC = {
  animation: 'timing' as const,
  config: { duration: DUREE_MS },
};

export const FONDU_ENCHAINE: StackNavigationOptions = {
  transitionSpec: { open: SPEC, close: SPEC },
  cardStyleInterpolator: ({ current }) => ({
    cardStyle: { opacity: current.progress },
  }),
};
