import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { API_URL } from 'src/config/api';
import { getSession } from 'src/auth/infrastructure/authStorage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function projectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId;
}

async function currentToken(): Promise<string | null> {
  const { data } = await Notifications.getExpoPushTokenAsync({
    projectId: projectId(),
  });

  return data ?? null;
}

export async function registerPushToken(): Promise<string | null> {
  try {
    const permission = await Notifications.getPermissionsAsync();

    let statut = permission.status;

    if (statut !== 'granted') {
      statut = (await Notifications.requestPermissionsAsync()).status;
    }

    if (statut !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const token = await currentToken();

    const session = await getSession();

    if (!session?.accessToken || !token) return null;

    await fetch(`${API_URL}/notifications/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });

    return token;
  } catch (error) {
    console.log('Push token registration error:', error);

    return null;
  }
}

export async function unregisterPushToken(): Promise<void> {
  try {
    const session = await getSession();

    const token = await currentToken();

    if (!token) return;

    await fetch(`${API_URL}/notifications/token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {}),
      },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.log('Push token removal error:', error);
  }
}
