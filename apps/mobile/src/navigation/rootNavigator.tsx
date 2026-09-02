import React from 'react';
import { AuthStackNavigator } from './authStack';
import { AppTabsNavigator } from './AppTabsNavigator';
import { AdminStackNavigator } from './AdminStack';
import { IdentityGateScreen } from '../auth/ui/IdentityGateScreen';

type Props = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  identiteVerifiee: boolean | null;
  onIdentiteVerifiee: () => void;
  introductionVue: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const RootNavigator: React.FC<Props> = ({
  isAuthenticated,
  isAdmin,
  identiteVerifiee,
  onIdentiteVerifiee,
  introductionVue,
  setIsAuthenticated,
}) => {
  if (!isAuthenticated) {
    return (
      <AuthStackNavigator
        setIsAuthenticated={setIsAuthenticated}
        introductionVue={introductionVue}
      />
    );
  }

  if (isAdmin) {
    return <AdminStackNavigator setIsAuthenticated={setIsAuthenticated} />;
  }

  if (identiteVerifiee === false) {
    return (
      <IdentityGateScreen
        onVerified={onIdentiteVerifiee}
        setIsAuthenticated={setIsAuthenticated}
      />
    );
  }

  return <AppTabsNavigator setIsAuthenticated={setIsAuthenticated} />;
};