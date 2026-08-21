import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { AppTabsParamList } from './type/appTabs';
import { ProfileStackNavigator } from './ProfileStack';
import { useTranslation } from 'react-i18next';
import { CustomTabBar } from './components/CustomTabBar';
import { ExchangeStackNavigator } from './ExchangeStack';
import { SearchStackNavigator } from './SearchStack';
import { SearchOnlyStackNavigator } from './SearchOnlyStack';
import { MessagesStackNavigator } from './MessagesStack';
import { useUnreadMessages } from 'src/chat/hooks/useUnreadMessages';
import * as Notifications from 'expo-notifications';

const Tab = createBottomTabNavigator<AppTabsParamList>();

function TestScreen() {
  return (
    <View style={styles.testScreen}>
      <Text>Test</Text>
    </View>
  );
}

type Props = {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AppTabsNavigator({ setIsAuthenticated }: Props) {
  const { t } = useTranslation('common');
  const unreadCount = useUnreadMessages();

  useEffect(() => {
    Notifications.setBadgeCountAsync(unreadCount).catch(() => undefined);
  }, [unreadCount]);

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => {
        const route = props.state.routes[props.state.index];

        const routeName =
          getFocusedRouteNameFromRoute(route) ?? route.name;

        if (routeName === 'Swipe' || routeName === 'Conversation') {
          return null;
        }

        return <CustomTabBar {...props} unreadCount={unreadCount} />;
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={SearchStackNavigator}
        options={{
          title: t('home'),
        }}
      />
      <Tab.Screen
        name="ExchangeTab"
        component={ExchangeStackNavigator}
        options={{
          title: t('exchange'),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        options={{
          title: t('search'),
        }}
      >
        {() => <SearchOnlyStackNavigator />}
      </Tab.Screen>
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStackNavigator}
        options={{
          title: t('messages'),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        options={{
          title: t('profile'),
        }}
      >
        {() => (
          <ProfileStackNavigator setIsAuthenticated={setIsAuthenticated} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  testScreen: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});