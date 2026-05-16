import { Navbar } from 'app/ui/component/Navbar';
import { getPublicProfileById } from 'app/profile/infrastructure/profile.api';
import { getHomesByOwnerId } from 'app/home/infrastructure/home.api';
import styles from './page.module.css';
import { ProfileCard } from 'app/profile/ui/components/ProfileCard';
import { HomeDetailsCard } from 'app/home/ui/components/HomeDetailsCard';
import { ReportUserButton } from 'app/home/ui/components/ReportUserButton';
import { getTranslations } from 'next-intl/server';

type Props = {
  searchParams: {
    userId?: string;
  };
};

export default async function ProfilePublicPage({ searchParams }: Props) {
  const params = await searchParams;
    const userId = params.userId;
    const t = await getTranslations();

  if (!userId) {
    return <p>{t('common.noUser')}</p>;
  }

  const [profile, homes] = await Promise.all([
    getPublicProfileById(userId),
    getHomesByOwnerId(userId),
  ]);

  return (
    <main className={styles.profilePage}>
      <Navbar />

      <section className={styles.content}>
        <div className={styles.leftColumn}>
          <ProfileCard profile={profile} />

          <ReportUserButton />
        </div>

        <div className={styles.rightColumn}>
          <h2 className={styles.sectionTitle}>{t('profile.homes')}</h2>

          {homes.map((home) => (
            <HomeDetailsCard key={home.id} home={home} />
          ))}
        </div>
      </section>
    </main>
  );
}