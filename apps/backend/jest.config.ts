import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 15000,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      diagnostics: { ignoreCodes: [151002] },
    }],
  },
};

export default config;
