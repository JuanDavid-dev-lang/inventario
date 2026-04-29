/**
 * Jest Configuration for Frontend Tests
 */

module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests/unit/frontend'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'frontend/src/**/*.{js,jsx}',
    '!frontend/src/main.jsx',
    '!frontend/src/index.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
