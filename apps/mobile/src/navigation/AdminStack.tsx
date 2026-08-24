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
