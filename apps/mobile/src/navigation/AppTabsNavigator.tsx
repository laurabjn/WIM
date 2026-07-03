import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { AppTabsParamList } from './type/appTabs';
import { ProfileStackNavigator } from './ProfileStack';
import { useTranslation } from 'react-i18next';
import { CustomTabBar } from './components/CustomTabBar';
import { ExchangesScreen } from 'src/home/ui/ExchangesScreen';
import { MenuScreen } from 'src/menu/ui/MenuScreen';
import { SearchScreen } from 'src/search/ui/SearchScreen';
import { SearchStackNavigator } from './SearchStack';

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

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeTab"
        component={MenuScreen}
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
        {() => <SearchStackNavigator />}
      </Tab.Screen>
      <Tab.Screen
        name="MessagesTab"
        component={TestScreen}
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
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});