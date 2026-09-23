type Body = { amount: number; currency?: string; description?: string; reference_id?: string; customer_email?: string; success_url?: string; cancel_url?: string };

function send(res:any, body:unknown, status=200) {
  res.statusCode=status;
  res.setHeader('content-type','application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req:any, res:any) {
  if (req.method !== 'POST') return send(res, { error: 'Method not allowed' }, 405);
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return send(res, { error: 'Stripe is not configured. Add STRIPE_SECRET_KEY in Vercel.' }, 503);
  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})) as Body;
    if (!body.amount || body.amount <= 0) return send(res, { error: 'Invalid amount' }, 400);
    const currency = (body.currency || 'usd').toLowerCase();
    const origin = req.headers?.origin || process.env.SB1_PUBLIC_URL || 'https://sb1.vercel.app';
    const successUrl = body.success_url || `${origin}/payments?success=1&reference=${encodeURIComponent(body.reference_id || '')}`;
    const cancelUrl = body.cancel_url || `${origin}/payments?cancelled=1&reference=${encodeURIComponent(body.reference_id || '')}`;
    const cents = Math.round(body.amount * 100);
    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('line_items[0][quantity]', '1');
    params.set('line_items[0][price_data][currency]', currency);
    params.set('line_items[0][price_data][unit_amount]', String(cents));
    params.set('line_items[0][price_data][product_data][name]', body.description || 'SB1 Medical Service');
    params.set('success_url', successUrl);
    params.set('cancel_url', cancelUrl);
    if (body.customer_email) params.set('customer_email', body.customer_email);
    const feePercent = Math.max(0, Math.min(100, Number(process.env.SB1_PLATFORM_FEE_PERCENT || 20)));
    const destination = process.env.STRIPE_CONNECT_ACCOUNT_ID;
    if (destination) {
      params.set('payment_intent_data[application_fee_amount]', String(Math.round(cents * feePercent / 100)));
      params.set('payment_intent_data[transfer_data][destination]', destination);
    }
    params.set('metadata[reference_id]', body.reference_id || '');
    params.set('metadata[platform]', 'SB1');
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await stripeResponse.json();
    if (!stripeResponse.ok) return send(res, { error: data?.error?.message || 'Stripe checkout failed' }, stripeResponse.status);
    return send(res, { url: data.url, id: data.id, platform_fee_percent: destination ? feePercent : 0 });
  } catch (error) {
    return send(res, { error: error instanceof Error ? error.message : 'Checkout failed' }, 500);
  }
}
