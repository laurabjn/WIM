import React from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import {
    createBottomTabNavigator,
    BottomTabNavigationOptions
} from '@react-navigation/bottom-tabs';
import { AppTabsParamList } from './type/appTabs';
import { ProfileStackNavigator } from './ProfileStack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<AppTabsParamList>();

function TestScreen() {
  return (
    <View>
      <Text>Test</Text>
    </View>
  );
}

type Props = {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AppTabsNavigator({ setIsAuthenticated }: Props) {
  const { t } = useTranslation('common');
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: 16,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#FFFFFF',
                borderTopWidth: 0,
                elevation: 8,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                paddingBottom: 8,
                paddingTop: 8,
            },
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
            },
        }}
        >
            <Tab.Screen
                name="HomeTab"
                component={TestScreen}
                options={{
                    title: t('home'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="SearchTab"
                component={TestScreen}
                options={{
                    title: t('search'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="MessagesTab"
                component={TestScreen}
                options={{
                    title: t('messages'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="mail-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={() => <ProfileStackNavigator setIsAuthenticated={setIsAuthenticated} />}
                options={{
                    title: t('profile'),
                    tabBarIcon: ({ color, size }) => (
                    <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  }
});