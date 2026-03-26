/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],

  moduleNameMapper: {
    '^react$': '<rootDir>/../../node_modules/react',
    '^react-dom$': '<rootDir>/../../node_modules/react-dom',
    '^react-native$': '<rootDir>/../../node_modules/react-native',
    '^react-test-renderer$': '<rootDir>/../../node_modules/react-test-renderer',
    '^@repo/(.*)$': '<rootDir>/../src/$1',
  },

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?@?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?|expo-.*|@expo/.*|@testing-library/.*|@react-navigation/.*))',
  ],
};