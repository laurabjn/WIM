import React from 'react';
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
import { ExchangesScreen } from 'src/home/ui/ExchangesScreen';
import { SearchStackNavigator } from './SearchStack';
import { SearchOnlyStackNavigator } from './SearchOnlyStack';
import { MessagesStackNavigator } from './MessagesStack';
import { useUnreadMessages } from 'src/chat/hooks/useUnreadMessages';

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

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => {
        const route = props.state.routes[props.state.index];

        const routeName =
          getFocusedRouteNameFromRoute(route) ?? route.name;

        if (routeName === 'Swipe') {
          return null;
        }

        return <CustomTabBar {...props} />;
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
        component={ExchangesScreen}
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
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
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
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});