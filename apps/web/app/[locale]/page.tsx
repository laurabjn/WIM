"use client";

import {useTranslations} from "next-intl";

export default function HomePage() {
  const t = useTranslations("common");

  return (
    <main style={{padding: 24}}>
      <h1>{t("appName")}</h1>
      <p>{t("continue")}</p>
    </main>
  );
}
