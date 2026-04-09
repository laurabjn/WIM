import React from 'react';
import { View } from 'react-native';
import { ProfileMenuItem } from './ProfileMenuItem';
import { useTranslation } from 'react-i18next';

type Props = {
  onPressFavorites: () => void;
  onPressSettings: () => void;
  onPressPreferences: () => void;
  onPressHelp: () => void;
  onPressLegal: () => void;
  onPressLogout: () => void;
};

export function ProfileMenuList({
  onPressFavorites,
  onPressSettings,
  onPressPreferences,
  onPressHelp,
  onPressLegal,
  onPressLogout,
}: Props) {
    const { t } = useTranslation('profile');

  return (
    <View>
      <ProfileMenuItem
        label={t('favorites')}
        icon="☆"
        onPress={onPressFavorites}
      />
      <ProfileMenuItem
        label={t('parameters')}
        icon="⚙"
        onPress={onPressSettings}
      />
      <ProfileMenuItem
        label={t('preferences')}
        icon="◌"
        onPress={onPressPreferences}
      />
      <ProfileMenuItem
        label={t('help')}
        icon="?"
        onPress={onPressHelp}
      />
      <ProfileMenuItem label={t('legal')} icon="⌂" onPress={onPressLegal} />
      <ProfileMenuItem
        label={t('logout')}
        icon="⇥"
        onPress={onPressLogout}
      />
    </View>
  );
}