export type AiAssistConfidence = 'low' | 'medium' | 'high';

export type AiAssistSource = 'mock-ai' | 'fallback-rule';

export type AiAssistResponse = {
  summary: string;
  nextSteps: string[];
  blockers: string[];
  risks: string[];
  confidence: AiAssistConfidence;
  source: AiAssistSource;
};

export type CargoStatusAssistRequest = {
  cargoId: string;
  locale?: string;
};
