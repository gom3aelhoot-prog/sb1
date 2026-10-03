import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SERPER_API_KEY is not configured' });

  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing q' });
  if (q.length > 200) return res.status(400).json({ error: 'Query too long' });

  const gl = String(req.query.gl || 'us').slice(0, 8);
  const hl = String(req.query.hl || 'en').slice(0, 8);
  const num = Math.min(Math.max(Number(req.query.num || 20), 1), 100);

  try {
    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q, gl, hl, num }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || data?.error || 'Serper image search failed',
      });
    }

    return res.status(200).json({
      searchParameters: data.searchParameters,
      images: Array.isArray(data.images) ? data.images : [],
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Image search failed',
    });
  }
}
