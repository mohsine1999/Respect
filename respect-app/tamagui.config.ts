import { createTamagui } from 'tamagui';

const tokens = {
  color: {
    background: '#f5f1ea',
    backgroundSubtle: '#eee5d9',
    surface: '#f9f5f2',
    surfaceElevated: '#fffdfa',
    surfacePressed: '#ece3d7',
    textPrimary: '#201d1a',
    textSecondary: '#5f5a56',
    textTertiary: '#8b857f',
    border: '#d9cfc2',
    accent: '#5d625d',
    accentSoft: '#e5e7e5',
    success: '#51715a',
    warning: '#b26a36',
    danger: '#9a5448',
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
  },
};

export const config = createTamagui({
  tokens,
  themes: {
    light: {
      background: '#f5f1ea',
      backgroundStrong: '#efeadf',
      backgroundSubtle: '#eee5d9',
      color: '#201d1a',
      colorStrong: '#201d1a',
      colorMuted: '#5f5a56',
      surface: '#f9f5f2',
      surfaceElevated: '#fffdfa',
      surfacePressed: '#ece3d7',
      border: '#d9cfc2',
      accent: '#5d625d',
      accentSoft: '#e5e7e5',
      success: '#51715a',
      warning: '#b26a36',
      danger: '#9a5448',
    },
    dark: {
      background: '#171716',
      backgroundStrong: '#1d1d1b',
      backgroundSubtle: '#252421',
      color: '#f4f1ec',
      colorStrong: '#ffffff',
      colorMuted: '#b9b3ae',
      surface: '#201f1d',
      surfaceElevated: '#292724',
      surfacePressed: '#34312d',
      border: '#3b3632',
      accent: '#c9d0bf',
      accentSoft: '#2a312a',
      success: '#7ead8e',
      warning: '#d6a06c',
      danger: '#d28a7d',
    },
  },
  media: {
    sm: { maxWidth: 600 },
    md: { minWidth: 600 },
  },
  shorthands: {},
});

export type AppConfig = typeof config;
export default config;
