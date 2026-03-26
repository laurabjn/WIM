const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [require.resolve('./test/setup-test.ts')],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@wim/shared$': path.resolve(__dirname, '../../packages/shared/src'),
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