import { getSessionUser, toPublicUser } from '@/shared/server/auth';
import { httpStatus } from '@/shared/http/http-status';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'unauthenticated', user: null }, { status: httpStatus.unauthorized });
  return Response.json({ user: toPublicUser(user) });
}
