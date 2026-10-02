import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=300');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.YOUTUBE_API_KEY;
  const q = String(req.query.q || '').trim();
  const type = String(req.query.type || 'video');

  if (!key) return res.status(503).json({
    error: 'YOUTUBE_API_KEY غير مضبوط في Vercel Environment Variables.'
  });
  if (!q) return res.status(400).json({ error: 'اكتب كلمة البحث أولاً.' });

  const params = new URLSearchParams({
    part: 'snippet',
    q,
    type,
    maxResults: '12',
    safeSearch: 'moderate'
  });

  const response = await fetch('https://www.googleapis.com/youtube/v3/search?' + params.toString() + '&key=' + encodeURIComponent(key));
  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({
      error: data?.error?.message || 'YouTube API error',
      details: data?.error?.errors || []
    });
  }

  const items = (data.items || []).map((item: any) => ({
    id: item.id?.videoId || item.id?.channelId || item.id?.playlistId,
    resourceType: item.id?.kind === 'youtube#video' ? 'video' : item.id?.kind === 'youtube#channel' ? 'channel' : 'playlist',
    title: item.snippet?.title || '',
    description: item.snippet?.description || '',
    thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
    channelTitle: item.snippet?.channelTitle || '',
    publishedAt: item.snippet?.publishedAt || '',
    url: item.id?.videoId
      ? 'https://www.youtube.com/watch?v=' + item.id.videoId
      : item.id?.channelId
        ? 'https://www.youtube.com/channel/' + item.id.channelId
        : 'https://www.youtube.com/playlist?list=' + item.id.playlistId,
    embedUrl: item.id?.videoId ? 'https://www.youtube.com/embed/' + item.id.videoId : ''
  }));

  return res.status(200).json({ items, nextPageToken: data.nextPageToken || null });
}
