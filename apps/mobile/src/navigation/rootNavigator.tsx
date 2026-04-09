import React from 'react';
import { AuthStackNavigator } from './authStack';
import { AppTabsNavigator } from './AppTabsNavigator';

type Props = {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const RootNavigator: React.FC<Props> = ({
  isAuthenticated,
  setIsAuthenticated,
}) => {
  return isAuthenticated ? (
    <AppTabsNavigator />
  ) : (
    <AuthStackNavigator setIsAuthenticated={setIsAuthenticated} />
  );
};