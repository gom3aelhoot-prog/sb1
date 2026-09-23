type Body = { amount: number; currency?: string; description?: string; reference_id?: string; customer_email?: string; success_url?: string; cancel_url?: string };

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return response({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY in Vercel.' }, 503);
  try {
    const body = (await req.json()) as Body;
    if (!body.amount || body.amount <= 0) return response({ error: 'Invalid amount' }, 400);
    const currency = (body.currency || 'usd').toLowerCase();
    const origin = req.headers.get('origin') || process.env.SB1_PUBLIC_URL || 'https://sb1.vercel.app';
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
    if (!stripeResponse.ok) return response({ error: data?.error?.message || 'Stripe checkout failed' }, stripeResponse.status);
    return response({ url: data.url, id: data.id, platform_fee_percent: destination ? feePercent : 0 });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : 'Checkout failed' }, 500);
  }
}
