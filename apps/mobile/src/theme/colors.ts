export function getThemeColors(isDark: boolean) {
  return {
    background: isDark ? '#111111' : '#FFFFFF',
    screen: isDark ? '#000000' : '#F8F8F8',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#111111',
    mutedText: isDark ? '#A1A1AA' : '#666666',
    border: isDark ? '#2C2C2E' : '#E5E5E5',
    input: isDark ? '#1C1C1E' : '#F5F5F5',
    primary: '#25A9E0',
  };
}