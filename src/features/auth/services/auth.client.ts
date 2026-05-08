
import type {
  HydroUser,
  LoginPayload,
  LoginResult,
  PublicHydroUser,
  RegisterOtpChallengeResponse,
  RegisterPayload
} from '../domain/auth.types';
import { apiRoutes } from '@/shared/routing/api-routes';
import { httpStatus } from '@/shared/http/http-status';

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((payload as { error?: string }).error ?? 'request-failed');
  return payload as T;
}

export async function getCurrentUser(): Promise<HydroUser | null> {
  const response = await fetch(apiRoutes.auth.me, { cache: 'no-store', credentials: 'include' });
  if (response.status === httpStatus.unauthorized) return null;
  const payload = await parseResponse<{ user: HydroUser | null }>(response);
  return payload.user;
}

/**
 * Login direto só para QA em ambiente não production (`apiRoutes.auth.qaDirectLogin`).
 * Não usar em fluxos de produção.
 */
export type MockModeLoginAsResult = {
  user: PublicHydroUser;
  redirectTo: string;
};

/** Login direto por userId (`POST apiRoutes.mockMode.loginAs`) — só dev/mock no servidor. */
export async function mockModeLoginAs(userId: string): Promise<MockModeLoginAsResult> {
  const response = await fetch(apiRoutes.mockMode.loginAs, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId }),
    credentials: 'include'
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload as { reason?: string }).reason ?? 'mock-mode-login-as-failed');
  }
  const data = payload as MockModeLoginAsResult;
  window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
  return data;
}

export async function qaDirectLogin(email: string): Promise<HydroUser> {
  const response = await fetch(apiRoutes.auth.qaDirectLogin, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'include'
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload as { reason?: string }).reason ?? 'qa-direct-login-failed');
  }
  const data = payload as { user: HydroUser };
  window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
  return data.user;
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await fetch(apiRoutes.auth.login, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await parseResponse<LoginResult>(response);
  if (data.user) window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
  return data;
}

export async function register(payload: RegisterPayload): Promise<HydroUser | RegisterOtpChallengeResponse> {
  const response = await fetch(apiRoutes.auth.register, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { error?: string }).error ?? 'request-failed');
  if ((data as RegisterOtpChallengeResponse).otpRequired) {
    return data as RegisterOtpChallengeResponse;
  }
  const created = data as { user: HydroUser };
  window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
  return created.user;
}

export async function updateProfile(nextUser: HydroUser & { avatarUrl?: string }): Promise<HydroUser & { avatarUrl?: string }> {
  const response = await fetch(apiRoutes.auth.profile, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(nextUser),
    credentials: 'include'
  });
  const data = await parseResponse<{ user: HydroUser }>(response);
  window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
  return data.user;
}

export async function logout(): Promise<void> {
  await fetch(apiRoutes.auth.logout, { method: 'POST', credentials: 'include' });
  window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
}
