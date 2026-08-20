import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { getThemeColors, ThemeColors } from './colors';

export type AppTheme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: AppTheme;
  effectiveTheme: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  setAppTheme: (theme: AppTheme) => Promise<void>;
};

const THEME_KEY = 'wim.settings.theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>('system');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  useEffect(() => {
    async function loadTheme() {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);

      if (
        savedTheme === 'light' ||
        savedTheme === 'dark' ||
        savedTheme === 'system'
      ) {
        setTheme(savedTheme);
      }
    }

    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const effectiveTheme = useMemo(() => {
    if (theme === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light';
    }

    return theme;
  }, [theme, systemTheme]);

  async function setAppTheme(nextTheme: AppTheme) {
    setTheme(nextTheme);
    await AsyncStorage.setItem(THEME_KEY, nextTheme);
  }

  const isDark = effectiveTheme === 'dark';

  const colors = useMemo(() => getThemeColors(isDark), [isDark]);

  return (
    <ThemeContext.Provider
      value={{ theme, effectiveTheme, isDark, colors, setAppTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Raccourci le plus utilise : un ecran n'a presque jamais besoin d'autre chose
// que de la palette.
export function useThemeColors(): ThemeColors {
  return useAppTheme().colors;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }

  return context;
}