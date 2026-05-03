import { getActiveMockScenario, resetMockScenario } from '@/shared/server/mock-db';
import { mockScenarioIds } from '@/shared/server/mock-scenarios';
import { getSessionUser } from '@/shared/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    data: {
      activeScenario: getActiveMockScenario(),
      scenarios: mockScenarioIds
    }
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'forbidden' }, { status: 403 });

  const payload = await request.json().catch(() => null) as { scenario?: string } | null;
  const result = resetMockScenario(payload?.scenario);

  return Response.json({
    data: {
      activeScenario: result.scenario,
      scenarios: mockScenarioIds,
      counts: {
        users: result.data.users.length,
        cargoes: result.data.cargoes.length,
        vessels: result.data.vessels.length,
        negotiations: result.data.negotiations.length,
        trackingEvents: result.data.trackingEvents.length
      }
    }
  });
}
