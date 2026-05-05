import { httpStatus } from '@/shared/http/http-status';

export function unauthenticated() {
  return Response.json({ error: 'unauthenticated' }, { status: httpStatus.unauthorized });
}

export function forbidden(reason?: string) {
  return Response.json(
    reason ? { error: 'forbidden', reason } : { error: 'forbidden' },
    { status: httpStatus.forbidden }
  );
}

export function invalidPayload(reason?: string) {
  return Response.json(
    reason ? { error: 'invalid-payload', reason } : { error: 'invalid-payload' },
    { status: httpStatus.badRequest }
  );
}

export function notFound(reason?: string) {
  return Response.json(
    reason ? { error: 'not-found', reason } : { error: 'not-found' },
    { status: httpStatus.notFound }
  );
}
