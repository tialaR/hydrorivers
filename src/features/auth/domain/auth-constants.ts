/** Senha demo dos usuários seed / personas QA (não é texto de UI). */
export const demoPassword = 'hydro123';

/** Dígitos do OTP mock numérico. */
export const otpLength = 6;

/** Cookie de sessão mock (`hydrorivers_session`). */
export const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: sessionMaxAgeSeconds
};
