const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [require.resolve('./test/setup-test.ts')],
  // Le tsconfig a baseUrl: '.', donc le code importe 'app/...' sans prefixe
  // relatif. Sans cela, Jest ne resout pas ces chemins la ou Next et tsc y
  // arrivent.
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@wim/shared$': path.resolve(__dirname, '../../packages/shared/src'),
    '\.(css|scss|sass)$': '<rootDir>/test/style-mock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)']
};