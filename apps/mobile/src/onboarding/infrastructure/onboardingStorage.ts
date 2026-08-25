import AsyncStorage from '@react-native-async-storage/async-storage';

const CLE = 'wim.onboarding.vu';

export async function introductionDejaVue(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLE)) === '1';
  } catch {
    return false;
  }
}

export async function marquerIntroductionVue(): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE, '1');
  } catch {
    return;
  }
}
