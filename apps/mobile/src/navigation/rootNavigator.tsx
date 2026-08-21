import React from 'react';
import { AuthStackNavigator } from './authStack';
import { AppTabsNavigator } from './AppTabsNavigator';
import { AdminStackNavigator } from './AdminStack';

type Props = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const RootNavigator: React.FC<Props> = ({
  isAuthenticated,
  isAdmin,
  setIsAuthenticated,
}) => {
  if (!isAuthenticated) {
    return <AuthStackNavigator setIsAuthenticated={setIsAuthenticated} />;
  }

  if (isAdmin) {
    return <AdminStackNavigator setIsAuthenticated={setIsAuthenticated} />;
  }

  return <AppTabsNavigator setIsAuthenticated={setIsAuthenticated} />;
};