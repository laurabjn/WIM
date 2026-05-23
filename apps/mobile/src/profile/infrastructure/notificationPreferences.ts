import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export async function requestPushNotificationsPermission() {
  const currentPermission = await Notifications.getPermissionsAsync();

  let finalStatus = currentPermission.status;

  if (currentPermission.status !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Notifications refusées',
      'Tu peux les réactiver dans les paramètres de ton téléphone.',
    );

    return false;
  }

  return true;
}