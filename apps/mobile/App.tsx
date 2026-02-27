import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { initI18n } from "./src/i18n/i18n";
import { RegisterScreen } from "./src/auth/ui/RegisterScreen";
import { LoginScreen } from "./src/auth/ui/LoginScreen";

initI18n();

export default function App() {
  const { t } = useTranslation("common");
  
  return (
    <View style={{ padding: 24 }}>
      <LoginScreen />
    </View>
  );
}
