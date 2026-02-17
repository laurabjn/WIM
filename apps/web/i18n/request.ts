import {getRequestConfig} from "next-intl/server";
import {en, fr} from "@wim/i18n";

export default getRequestConfig(async ({requestLocale}) => {
  const locale = (await requestLocale) || "fr";

  return {
    locale,
    messages: locale === "en" ? en : fr
  };
});
