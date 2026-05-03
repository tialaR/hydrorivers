
import type { HydroUser, LoginPayload, LoginResult, RegisterPayload } from '../domain/auth.types';

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((payload as { error?: string }).error ?? 'request-failed');
  return payload as T;
}

export async function getCurrentUser(): Promise<HydroUser | null> {
  const response = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
  if (response.status === 401) return null;
  const payload = await parseResponse<{ user: HydroUser | null }>(response);
  return payload.user;
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await parseResponse<LoginResult>(response);
  if (data.user) window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
  return data;
}

export async function register(payload: RegisterPayload): Promise<HydroUser> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await parseResponse<{ user: HydroUser }>(response);
  window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
  return data.user;
}

export async function updateProfile(nextUser: HydroUser & { avatarUrl?: string }): Promise<HydroUser & { avatarUrl?: string }> {
  const response = await fetch('/api/auth/profile', {
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
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.dispatchEvent(new CustomEvent('hydrorivers:auth-changed'));
}
