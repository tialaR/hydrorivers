export type AiAssistConfidence = 'low' | 'medium' | 'high';

export type AiAssistSource = 'mock-ai' | 'fallback-rule';

export type AiAssistResponse = {
  heading?: string;
  summary: string;
  explanation?: string;
  nextSteps: string[];
  blockers: string[];
  risks: string[];
  attentionPoints?: string[];
  confidence: AiAssistConfidence;
  source: AiAssistSource;
};

export type CargoStatusAssistRequest = {
  cargoId: string;
  locale?: string;
};
