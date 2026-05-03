import { readMock } from '@/shared/server/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ data: readMock('vessels') });
}
