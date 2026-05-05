import { cookies } from 'next/headers';
import { cookieNames } from '@/shared/http/cookie-names';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieNames.session);
  return Response.json({ ok: true });
}
