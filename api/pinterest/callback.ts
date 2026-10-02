const json = (res: any, body: any, status = 200) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return json(res, { error: 'Method not allowed' }, 405);
  }

  const code = String(req.query?.code || '');
  const error = String(req.query?.error || '');
  const state = String(req.query?.state || '');

  if (error) {
    return json(res, {
      ok: false,
      provider: 'pinterest',
      error,
      state: state || null,
    }, 400);
  }

  if (!code) {
    return json(res, {
      ok: false,
      provider: 'pinterest',
      error: 'Pinterest authorization code is missing.',
    }, 400);
  }

  return json(res, {
    ok: true,
    provider: 'pinterest',
    message: 'Pinterest authorization callback received. The authorization code must be exchanged server-side for an access token.',
    state: state || null,
  });
}
