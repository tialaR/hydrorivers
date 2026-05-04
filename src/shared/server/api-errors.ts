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
