import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const serveurDeLApi = (() => {
  const brut = process.env.NEXT_PUBLIC_API_URL;

  if (!brut) return null;

  try {
    const adresse = new URL(brut);

    return {
      protocol: adresse.protocol.replace(':', ''),
      hostname: adresse.hostname,
      port: adresse.port || undefined,
      pathname: '/uploads/**',
    };
  } catch {
    return null;
  }
})();

const enDeveloppement = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '3002',
    pathname: '/uploads/**',
  },
  {
    protocol: 'http',
    hostname: '192.168.0.34',
    port: '3002',
    pathname: '/uploads/**',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Le SDK serveur de Sentry importe node:inspector. Turbopack en ferait un
  // fragment dont le nom contient deux-points, interdits par Windows, et la
  // copie vers .next/standalone echouerait a la construction. Le garder hors
  // du paquet le resout, et c'est de toute facon la place d'un paquet qui
  // touche aux entrailles de Node.
  serverExternalPackages: ['@sentry/nextjs'],
  images: {
    remotePatterns: [
      ...enDeveloppement,
      ...(serveurDeLApi ? [serveurDeLApi] : []),
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

// Les fichiers de correspondance ne partent chez Sentry que si un jeton est
// fourni a la construction. Sans lui l'image se construit quand meme, les
// piles restent seulement minifiees.
const televersementDesSources = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  telemetry: false,
  disableLogger: true,
  sourcemaps: {
    disable: !televersementDesSources,
  },
});
