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

    background: isDark ? '#0F0F10' : '#FFFFFF',
    screen: isDark ? '#000000' : '#F4F4F4',
    surface: isDark ? '#1C1C1E' : '#FFFFFF',
    surfaceAlt: isDark ? '#232326' : '#F4F4F5',

    text: isDark ? '#F5F5F5' : '#111111',
    textMuted: isDark ? '#A1A1AA' : '#6B7280',
    textFaint: isDark ? '#6B6B70' : '#B4B4B8',

    border: isDark ? '#2C2C2E' : '#E5E7EB',

    contrast: isDark ? '#F5F5F5' : '#111111',
    onContrast: isDark ? '#111111' : '#FFFFFF',

    bubbleMine: isDark ? '#0B6FA4' : '#111111',
    onBubbleMine: '#FFFFFF',
    bubbleTheirs: isDark ? '#232326' : '#F1F1F1',
    onBubbleTheirs: isDark ? '#F5F5F5' : '#111111',

    overlay: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)',
  };
}
