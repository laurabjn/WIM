import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Navbar } from 'app/ui/component/Navbar';
import { getHomeById } from 'app/home/infrastructure/home.api';
import { HomeDetail } from 'app/home/ui/HomeDetail';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

async function chargerLogement(id: string) {
  try {
    return await getHomeById(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const home = await chargerLogement(id);

  if (!home) return {};

  const lieu = `${home.city}, ${home.country}`;
  const photo = home.photos?.[0]?.url;

  return {
    title: `${home.title} — ${lieu}`,
    description: home.description?.slice(0, 200),
    openGraph: {
      type: 'article',
      title: `${home.title} — ${lieu}`,
      description: home.description?.slice(0, 200),
      images: photo ? [{ url: photo }] : undefined,
    },
    twitter: {
      card: photo ? 'summary_large_image' : 'summary',
      title: `${home.title} — ${lieu}`,
      description: home.description?.slice(0, 200),
      images: photo ? [photo] : undefined,
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale, id } = await params;
  const home = await chargerLogement(id);

  if (!home) notFound();

  return (
    <main>
      <Navbar />

      <HomeDetail home={home} locale={locale} />
    </main>
  );
}
