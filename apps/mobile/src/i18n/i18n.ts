import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {en, fr} from "../../../../packages/i18n/src";

const STORAGE_KEY = "wim.locale";

async function getSavedLocale(): Promise<"fr" | "en"> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  return saved === "en" ? "en" : "fr";
}

export async function initI18n() {
  const locale = await getSavedLocale();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        fr: {
          common: fr.common,
          auth: fr.auth,
          profile: fr.profile,
          home: fr.home,
        },
        en: {
          common: en.common,
          auth: en.auth,
          profile: en.profile,
          home: en.home,
        },
      },
      lng: locale,
      fallbackLng: "fr",
      ns: ["common", "auth", "profile", "home"],
      defaultNS: "common",
      interpolation: {escapeValue: false}
    });

  return i18n;
}

export async function setLocale(locale: "fr" | "en") {
  await AsyncStorage.setItem(STORAGE_KEY, locale);
  await i18n.changeLanguage(locale);
}

export default i18n;
