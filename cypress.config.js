/**
 * Cypress Configuration
 */

module.exports = {
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    navigateTimeout: 2000,
    animationDistanceThreshold: 5,
    chromeWebSecurity: false,
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    pageLoadTimeout: 60000,
  },
};
