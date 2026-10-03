import crypto from 'node:crypto';

const PINTEREST_AUTHORIZE_URL = 'https://www.pinterest.com/oauth/';
const PINTEREST_TOKEN_URL = 'https://api.pinterest.com/v5/oauth/token';

const json = (res: any, body: any, status = 200) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

const getRedirectUri = (req: any) => {
  const configured = String(process.env.PINTEREST_REDIRECT_URI || '').trim();
  if (configured) return configured;

  const publicUrl = String(process.env.PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  if (publicUrl) return publicUrl + '/api/pinterest/callback';

  const proto = String(req.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '').split(',')[0].trim();
  return host ? proto + '://' + host + '/api/pinterest/callback' : '';
};

const scopes = () =>
  String(
    process.env.PINTEREST_SCOPES ||
      'user_accounts:read,boards:read,boards:write,pins:read,pins:write'
  ).trim();

const redirectAfterConnect = (req: any, status: 'connected' | 'error', message?: string) => {
  const target = String(process.env.PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  if (!target) return '';
  const url = new URL(target);
  url.searchParams.set('pinterest', status);
  if (message) url.searchParams.set('message', message.slice(0, 180));
  return url.toString();
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return json(res, { error: 'Method not allowed' }, 405);

  const clientId = String(process.env.PINTEREST_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.PINTEREST_CLIENT_SECRET || '').trim();
  const redirectUri = getRedirectUri(req);

  if (!clientId || !clientSecret || !redirectUri) {
    return json(res, {
      ok: false,
      provider: 'pinterest',
      error: 'Pinterest OAuth is not configured. Set PINTEREST_CLIENT_ID, PINTEREST_CLIENT_SECRET and PINTEREST_REDIRECT_URI (or PUBLIC_SITE_URL).',
      redirect_uri: redirectUri || null,
    }, 500);
  }

  const code = String(req.query?.code || '');
  const error = String(req.query?.error || '');
  const returnedState = String(req.query?.state || '');

  if (error) {
    const location = redirectAfterConnect(req, 'error', error);
    if (location) {
      res.statusCode = 302;
      res.setHeader('Location', location);
      return res.end();
    }
    return json(res, { ok: false, provider: 'pinterest', error }, 400);
  }

  if (!code) {
    const state = crypto.randomBytes(24).toString('hex');
    res.setHeader(
      'Set-Cookie',
      'sb1_pinterest_oauth_state=' + encodeURIComponent(state) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600'
    );

    const auth = new URL(PINTEREST_AUTHORIZE_URL);
    auth.searchParams.set('client_id', clientId);
    auth.searchParams.set('redirect_uri', redirectUri);
    auth.searchParams.set('response_type', 'code');
    auth.searchParams.set('scope', scopes());
    auth.searchParams.set('state', state);

    res.statusCode = 302;
    res.setHeader('Location', auth.toString());
    return res.end();
  }

  const cookieHeader = String(req.headers?.cookie || '');
  const match = cookieHeader.match(/(?:^|;\s*)sb1_pinterest_oauth_state=([^;]+)/);
  const expectedState = match ? decodeURIComponent(match[1]) : '';

  if (!returnedState || !expectedState || returnedState !== expectedState) {
    const location = redirectAfterConnect(req, 'error', 'Pinterest OAuth state validation failed.');
    if (location) {
      res.statusCode = 302;
      res.setHeader('Location', location);
      return res.end();
    }
    return json(res, { ok: false, provider: 'pinterest', error: 'OAuth state validation failed.' }, 400);
  }

  const basic = Buffer.from(clientId + ':' + clientSecret).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(PINTEREST_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + basic,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
  } catch {
    return json(res, { ok: false, provider: 'pinterest', error: 'Could not reach Pinterest OAuth.' }, 502);
  }

  const tokenData = await tokenResponse.json().catch(() => ({} as any));
  if (!tokenResponse.ok || !tokenData.access_token) {
    const location = redirectAfterConnect(req, 'error', tokenData.error_description || tokenData.error || 'Pinterest token exchange failed.');
    if (location) {
      res.statusCode = 302;
      res.setHeader('Location', location);
      return res.end();
    }
    return json(res, { ok: false, provider: 'pinterest', error: tokenData.error_description || tokenData.error || 'Pinterest token exchange failed.' }, 400);
  }

  const cookies = [
    'sb1_pinterest_access_token=' + encodeURIComponent(tokenData.access_token) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + Math.max(300, Number(tokenData.expires_in || 2592000)),
    tokenData.refresh_token
      ? 'sb1_pinterest_refresh_token=' + encodeURIComponent(tokenData.refresh_token) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=5184000'
      : '',
    'sb1_pinterest_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
  ].filter(Boolean);

  const location = redirectAfterConnect(req, 'connected');
  if (location) {
    res.statusCode = 302;
    res.setHeader('Set-Cookie', cookies);
    res.setHeader('Location', location);
    return res.end();
  }

  res.statusCode = 200;
  res.setHeader('Set-Cookie', cookies);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify({
    ok: true,
    provider: 'pinterest',
    connected: true,
    scope: tokenData.scope || scopes(),
    expires_in: tokenData.expires_in || null,
  }));
}
