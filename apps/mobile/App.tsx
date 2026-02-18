import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { initI18n } from "./src/i18n/i18n";

initI18n();

export default function App() {
  const { t } = useTranslation("common");
  
  return (
    <View style={{ padding: 24 }}>
      <Text>{t("appName")}</Text>
      <Text>{t("continue")}</Text>
    </View>
  );
}
