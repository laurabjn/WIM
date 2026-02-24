import '@testing-library/jest-dom';
import 'whatwg-fetch';

jest.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string) => key;
  },
}));