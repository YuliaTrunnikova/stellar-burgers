import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://192.168.1.64:4000',
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
