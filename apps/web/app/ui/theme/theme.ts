export type Theme = 'light' | 'dark' | 'system';

export const CLE_THEME = 'wim.theme';

export function lireTheme(): Theme {
  try {
    const stocke = localStorage.getItem(CLE_THEME);

    return stocke === 'light' || stocke === 'dark' ? stocke : 'system';
  } catch {
    return 'system';
  }
}

export function appliquerTheme(theme: Theme) {
  const racine = document.documentElement;

  if (theme === 'system') {
    delete racine.dataset.theme;

    return;
  }

  racine.dataset.theme = theme;
}

export function enregistrerTheme(theme: Theme) {
  appliquerTheme(theme);

  try {
    if (theme === 'system') {
      localStorage.removeItem(CLE_THEME);

      return;
    }

    localStorage.setItem(CLE_THEME, theme);
  } catch {
    return;
  }
}
