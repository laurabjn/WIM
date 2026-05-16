import React, { createContext, useContext, useMemo, useState } from 'react';
import { Home } from '@wim/shared/home/home.type';

export const defaultHome: Home = {
    id: '',
    ownerId: '',
    title: '',
    description: '',
    address: '',
    city: '',
    country: '',
    latitude: undefined,
    longitude: undefined,
    capacity: 1,
    homeType: '',
    amenities: [],
    carExchangeAccepted: false,
    photos: [],
    createdAt: '',
    updatedAt: '',
};

type HomeCreationContextValue = {
  draft: Home;
  updateDraft: (patch: Partial<Home>) => void;
  resetDraft: () => void;
};

const HomeCreationContext = createContext<HomeCreationContextValue | null>(null);

export function HomeCreationProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Home>(defaultHome);

  const value = useMemo(
    () => ({
      draft,
      updateDraft: (patch: Partial<Home>) => {
        setDraft((prev) => ({ ...prev, ...patch }));
      },
      resetDraft: () => setDraft(defaultHome),
    }),
    [draft],
  );

  return (
    <HomeCreationContext.Provider value={value}>
      {children}
    </HomeCreationContext.Provider>
  );
}

export function useHomeCreation() {
  const context = useContext(HomeCreationContext);
  if (!context) {
    throw new Error('useHomeCreation must be used within HomeCreationProvider');
  }
  return context;
}