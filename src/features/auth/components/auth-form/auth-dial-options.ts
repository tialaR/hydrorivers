/** Prefixos exibidos no cadastro/login mock (E.164 sem espaços). */
export const AUTH_DIAL_OPTIONS = ['+55', '+1', '+34', '+351', '+54', '+598'] as const;

export type AuthDialCode = (typeof AUTH_DIAL_OPTIONS)[number];
