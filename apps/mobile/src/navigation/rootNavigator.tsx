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

  // Un compte d'administration ne voit que son panneau : lui donner les
  // onglets ordinaires le ferait apparaitre dans les swipes et les recherches
  // des autres, et fausserait ses propres chiffres.
  if (isAdmin) {
    return <AdminStackNavigator setIsAuthenticated={setIsAuthenticated} />;
  }

  return <AppTabsNavigator setIsAuthenticated={setIsAuthenticated} />;
};