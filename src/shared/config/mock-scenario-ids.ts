export type MockScenarioId =
  | 'empty-state'
  | 'market-active'
  | 'negotiation-flow'
  | 'in-transit'
  | 'completed'
  | 'error-scenarios';

export const mockScenarioIds: MockScenarioId[] = [
  'empty-state',
  'market-active',
  'negotiation-flow',
  'in-transit',
  'completed',
  'error-scenarios'
];
