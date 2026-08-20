// Les couleurs de marque ne changent pas avec le theme : c'est ce qui rend
// l'application reconnaissable dans les deux modes.
export const BRAND = {
  primary: '#087EBE',
  accent: '#52D1A6',
  info: '#2DA7F3',
  danger: '#DC2626',
  success: '#22C55E',
  warning: '#D88500',
} as const;

export type ThemeColors = ReturnType<typeof getThemeColors>;

export function getThemeColors(isDark: boolean) {
  return {
    ...BRAND,

    // Fonds : l'ecran, les cartes posees dessus, et les blocs gris qui
    // servaient partout a detacher une zone.
    background: isDark ? '#0F0F10' : '#FFFFFF',
    screen: isDark ? '#000000' : '#F4F4F4',
    surface: isDark ? '#1C1C1E' : '#FFFFFF',
    surfaceAlt: isDark ? '#232326' : '#F4F4F5',

    // Textes, du plus appuye au plus efface.
    text: isDark ? '#F5F5F5' : '#111111',
    textMuted: isDark ? '#A1A1AA' : '#6B7280',
    textFaint: isDark ? '#6B6B70' : '#B4B4B8',

    border: isDark ? '#2C2C2E' : '#E5E7EB',

    // Un bouton noir sur fond blanc devient clair sur fond noir : sans cette
    // paire, son libelle disparaitrait dans le mode sombre.
    contrast: isDark ? '#F5F5F5' : '#111111',
    onContrast: isDark ? '#111111' : '#FFFFFF',

    // Bulles de conversation : la sienne doit rester lisible dans les deux
    // modes, or un noir sur fond noir ne se distingue plus.
    bubbleMine: isDark ? '#0B6FA4' : '#111111',
    onBubbleMine: '#FFFFFF',
    bubbleTheirs: isDark ? '#232326' : '#F1F1F1',
    onBubbleTheirs: isDark ? '#F5F5F5' : '#111111',

    overlay: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)',
  };
}
