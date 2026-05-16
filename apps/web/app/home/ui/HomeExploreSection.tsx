'use client';
import { useMemo, useState } from 'react';
import { Home } from '@wim/shared/home/home.type';
import styles from './HomeExploreSection.module.css';
import { CategoryFilter } from './components/CategoryFilter';
import { HeroSearch } from './components/HeroSearch';
import { HomeCard } from './components/HomeCard';

type Props = {
  homes: Home[];
  labels: {
    toExplore: string;
    fastSearch: string;
    lastSearches: string;
  };
};

export function HomeExploreSection({ homes, labels }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredHomes = useMemo(() => {
    if (selectedCategory === 'all') return homes;

    return homes.filter((home) => {
      return home.category === selectedCategory || home.homeType === selectedCategory;
    });
  }, [homes, selectedCategory]);

  const featuredHome = filteredHomes[0];
  const recentHomes = filteredHomes.slice(1, 4);

  return (
  <section className={styles.wrapper}>
    <div className={styles.modeRow}>
      <span>{labels.toExplore}</span>
      <div className={styles.toggle}>
        <div className={styles.toggleDot} />
      </div>
      <span>{labels.fastSearch}</span>
    </div>

    <div className={styles.menuContent}>
      <div className={styles.leftColumn}>
        {featuredHome && <HeroSearch home={featuredHome} />}
      </div>

      <div className={styles.rightColumn}>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onChangeCategory={setSelectedCategory}
        />

        <h2>{labels.lastSearches}</h2>

        {recentHomes.map((home) => (
          <HomeCard key={home.id} home={home} />
        ))}
      </div>
    </div>
  </section>
  );
}