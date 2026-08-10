module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    // Babel options are inlined rather than left to .babelrc. A .babelrc only
    // applies to files under its own directory, and the tests live in
    // ../tests/unit/frontend, so without this their JSX is never compiled and
    // the whole suite fails to parse.
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
      // api.js reads import.meta.env (Vite). CommonJS cannot parse that at
      // all, so it is rewritten before jest ever sees the file.
      plugins: ['babel-plugin-transform-import-meta']
    }]
  },
  // Tests live in the repo-level tests/ tree, not beside the source, so jest is
  // pointed at both roots instead of only at frontend/.
  roots: ['<rootDir>/src', '<rootDir>/../tests/unit/frontend'],
  // Node resolution walks up from the test file, which sits outside frontend/
  // and so never reaches its node_modules. This adds it explicitly.
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  // axios v1 ships ES modules. node_modules is untransformed by default, so
  // importing it from a test throws a parse error until it is excluded here.
  transformIgnorePatterns: ['node_modules/(?!(axios)/)'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/index.js'
  ]
};
