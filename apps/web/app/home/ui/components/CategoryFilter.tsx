'use client';

import { useTranslations } from 'next-intl';
import styles from './CategoryFilter.module.css';

type Category = {
  key: string;
  label: string;
  icon: string;
};

type Props = {
  selectedCategory: string;
  onChangeCategory: (category: string) => void;
};

export function CategoryFilter({ selectedCategory, onChangeCategory }: Props) {
  const t = useTranslations();
  
  const categories: Category[] = [
    { key: 'nature', label: t('search.category.nature'), icon: '♣' },
    { key: 'beach', label: t('search.category.beach'), icon: '≋' },
    { key: 'city', label: t('search.category.city'), icon: '♜' },
    { key: 'culture', label: t('search.category.culture'), icon: '▥' },
  ];

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>{t('search.categories')}</h2>

      <div className={styles.row}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.key;

          return (
            <button
              key={category.key}
              type="button"
              className={styles.item}
              onClick={() =>
                onChangeCategory(isSelected ? 'all' : category.key)
              }
            >
              <span
                className={[
                  styles.iconCircle,
                  styles[category.key],
                  isSelected ? styles.selected : '',
                ].join(' ')}
              >
                {category.icon}
              </span>

              <span className={styles.label}>{category.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}