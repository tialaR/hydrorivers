export function unauthenticated() {
  return Response.json({ error: 'unauthenticated' }, { status: 401 });
}

export function forbidden(reason?: string) {
  return Response.json(
    reason ? { error: 'forbidden', reason } : { error: 'forbidden' },
    { status: 403 }
  );
}

export function invalidPayload(reason?: string) {
  return Response.json(
    reason ? { error: 'invalid-payload', reason } : { error: 'invalid-payload' },
    { status: 400 }
  );
}

export function notFound(reason?: string) {
  return Response.json(
    reason ? { error: 'not-found', reason } : { error: 'not-found' },
    { status: 404 }
  );
}
