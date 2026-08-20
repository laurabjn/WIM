import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AdminDashboardScreen } from 'src/admin/ui/AdminDashboardScreen';
import { AdminScreen } from 'src/admin/ui/AdminScreen';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminReports: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

type Props = {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Parcours reserve a l'administration : ni onglets, ni swipe, ni profil. Un
 * compte d'administration n'a rien a faire dans l'application ordinaire, et
 * l'y laisser entrer brouillerait ses propres statistiques.
 */
export function AdminStackNavigator({ setIsAuthenticated }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard">
        {(
          props: NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>,
        ) => (
          <AdminDashboardScreen
            {...props}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="AdminReports" component={AdminScreen} />
    </Stack.Navigator>
  );
}
