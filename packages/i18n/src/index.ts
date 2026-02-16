import fr from "./locales/fr.json";
import en from "./locales/en.json";

export const messages = { fr, en };
export type Locale = keyof typeof messages;
