import '@testing-library/jest-native/extend-expect';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, 
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));
