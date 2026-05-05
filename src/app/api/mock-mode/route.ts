import { getActiveMockScenario, resetMockScenario } from '@/shared/server/mock-db';
import { mockScenarioIds } from '@/shared/server/mock-scenarios';
import { getSessionUser } from '@/shared/server/auth';
import { forbidden, invalidPayload } from '@/shared/server/api-errors';
import { isMockModeResetAllowed } from '@/shared/config/env';
import { httpStatus } from '@/shared/http/http-status';

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

function parseMockModeBody(raw: string): { scenario?: string } | Response {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return invalidPayload('invalid-json');
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return invalidPayload('invalid-json');
  }

  return parsed as { scenario?: string };
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'unauthenticated' }, { status: httpStatus.unauthorized });
  if (user.role !== 'admin') return Response.json({ error: 'forbidden' }, { status: httpStatus.forbidden });
  if (!isMockModeResetAllowed()) {
    return forbidden('mock-mode-reset-disabled');
  }

  const rawBody = await request.text();
  const parsed = parseMockModeBody(rawBody);
  if (parsed instanceof Response) {
    return parsed;
  }

  const result = resetMockScenario(parsed.scenario);

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
