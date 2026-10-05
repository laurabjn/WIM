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

export default withNextIntl(nextConfig);
