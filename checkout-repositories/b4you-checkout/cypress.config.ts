/* eslint-disable @typescript-eslint/no-require-imports */
import { defineConfig } from "cypress";
const {
  beforeRunHook,
  afterRunHook,
} = require("cypress-mochawesome-reporter/lib");

export default defineConfig({
  projectId: 'uvj3s9',
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    charts: true,
    reportPageTitle: "custom-title",
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  retries: {
    runMode: 1,
    openMode: 1,
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
  video: true,
  screenshotOnRunFailure: true,
  screenshotsFolder: "cypress/screenshots",
  videosFolder: "cypress/videos",
  trashAssetsBeforeRuns: true,
  e2e: {
    supportFile: false,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    screenshotOnRunFailure: false,
    waitForAnimations: true,
    animationDistanceThreshold: 1000,
    viewportWidth: 1920,
    viewportHeight: 1024,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on) {
      require("cypress-mochawesome-reporter/plugin")(on);
      on("before:browser:launch", (browser, launchOptions) => {
        launchOptions.args.push("--disable-animations");
        launchOptions.args.push("--disable-raf-throttling");
        if (browser.family === "chromium") {
          launchOptions.args.push("--ignore-certificate-errors");
        }
        return launchOptions;
      });
      on("before:run", async (details) => {
        await beforeRunHook(details);
      });

      on("after:run", async () => {
        await afterRunHook();
      });
    },
  },
});
