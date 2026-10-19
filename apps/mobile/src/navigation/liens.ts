import { getStateFromPath } from '@react-navigation/native';
import type {
  LinkingOptions,
  NavigatorScreenParams,
} from '@react-navigation/native';

import { APP_URL } from 'src/config/api';

const LOCALES = /^\/(fr|en)(?=\/|$)/;

type ArbreDeLiens = {
  HomeTab: NavigatorScreenParams<{ HomeDetails: { homeId: string } }>;
};

export const liens: LinkingOptions<ArbreDeLiens> = {
  prefixes: [APP_URL, 'wim://'],

  config: {
    screens: {
      HomeTab: {
        screens: {
          HomeDetails: 'homes/:homeId',
        },
      },
    },
  },

  getStateFromPath(chemin, options) {
    return getStateFromPath(chemin.replace(LOCALES, '') || '/', options);
  },
};
