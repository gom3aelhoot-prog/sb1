export default async function handler(req:any,res:any){
 const method=req.method||'GET';
 if(method!=='GET') return res.status(405).json({error:'Method not allowed'});
 const q=String(req.query?.q||'').trim();
 const type=String(req.query?.type||'video');
 if(!q)return res.status(400).json({error:'q is required'});
 const key=process.env.YOUTUBE_API_KEY;
 if(!key)return res.status(503).json({error:'YOUTUBE_API_KEY is not configured'});
 const url=new URL('https://www.googleapis.com/youtube/v3/search');
 url.searchParams.set('part','snippet');url.searchParams.set('q',q);url.searchParams.set('type',type);url.searchParams.set('maxResults','12');url.searchParams.set('key',key);
 try{const r=await fetch(url);const data=await r.json();if(!r.ok)return res.status(r.status).json({error:data?.error?.message||'YouTube API error'});return res.status(200).json({items:(data.items||[]).map((x:any)=>({id:x.id?.videoId||x.id?.channelId||x.id?.playlistId,title:x.snippet?.title||'',description:x.snippet?.description||'',channelTitle:x.snippet?.channelTitle||'',publishedAt:x.snippet?.publishedAt||'',thumbnail:x.snippet?.thumbnails?.medium?.url||x.snippet?.thumbnails?.default?.url||'',kind:x.id?.kind||''}))});}catch(e){return res.status(500).json({error:'YouTube request failed'})}
}
