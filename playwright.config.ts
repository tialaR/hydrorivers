import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure'
  },
  webServer: {
    command:
      'HYDRORIVERS_EXPOSE_OTP_CODE=true HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true HYDRORIVERS_FORCE_MOCK_QA_UI=true HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true npm run build && HYDRORIVERS_EXPOSE_OTP_CODE=true HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true HYDRORIVERS_FORCE_MOCK_QA_UI=true HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true npm run start -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 240000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
