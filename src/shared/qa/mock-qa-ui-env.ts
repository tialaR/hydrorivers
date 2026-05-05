export function isMockQaUiEnabled(): boolean {
  if (process.env.HYDRORIVERS_FORCE_MOCK_QA_UI === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}
