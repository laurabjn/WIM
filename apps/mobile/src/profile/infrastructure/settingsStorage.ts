import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'light' | 'dark' | 'system';
export type AppCurrency = 'EUR' | 'USD' | 'GBP';
export type DistanceUnit = 'km' | 'mi';

const SETTINGS_KEYS = {
  theme: 'wim.settings.theme',
  pushNotifications: 'wim.settings.pushNotifications',
  smsNotifications: 'wim.settings.smsNotifications',
  newMessages: 'wim.settings.newMessages',
  newExchangeDays: 'wim.settings.newExchangeDays',
  marketingEmails: 'wim.settings.marketingEmails',
  profileVisible: 'wim.settings.profileVisible',
  showPreciseLocation: 'wim.settings.showPreciseLocation',
  showAge: 'wim.settings.showAge',
  allowMessages: 'wim.settings.allowMessages',
  currency: 'wim.settings.currency',
  distanceUnit: 'wim.settings.distanceUnit',
};

export async function saveSetting(key: keyof typeof SETTINGS_KEYS, value: unknown) {
  await AsyncStorage.setItem(SETTINGS_KEYS[key], JSON.stringify(value));
}

export async function getSetting<T>(key: keyof typeof SETTINGS_KEYS, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(SETTINGS_KEYS[key]);

  if (!value) return fallback;

  return JSON.parse(value) as T;
}

export async function getAllSettings() {
  return {
    theme: await getSetting<AppTheme>('theme', 'system'),
    pushNotifications: await getSetting('pushNotifications', false),
    smsNotifications: await getSetting('smsNotifications', false),
    newMessages: await getSetting('newMessages', true),
    newExchangeDays: await getSetting('newExchangeDays', true),
    marketingEmails: await getSetting('marketingEmails', false),
    profileVisible: await getSetting('profileVisible', true),
    showPreciseLocation: await getSetting('showPreciseLocation', false),
    showAge: await getSetting('showAge', true),
    allowMessages: await getSetting('allowMessages', true),
    currency: await getSetting<AppCurrency>('currency', 'EUR'),
    distanceUnit: await getSetting<DistanceUnit>('distanceUnit', 'km'),
  };
}