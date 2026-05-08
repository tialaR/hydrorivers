/** Senha demo dos usuários seed / personas QA (não é texto de UI). */
export const demoPassword = 'hydro123';

/** Mínimo de caracteres aceito para novas senhas no fluxo evoluído de auth. */
export const minimumPasswordLength = 8;

/** Dígitos do OTP mock numérico. */
export const otpLength = 6;

/** Expiração fake padrão do desafio OTP mock. */
export const otpExpiresInSeconds = 60 * 5;

/** Roles públicos permitidos na UI/registro público. */
export const publicUserRoles = ['shipper', 'carrier'] as const;

/** Cookie de sessão mock (`hydrorivers_session`). */
export const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: sessionMaxAgeSeconds
};
