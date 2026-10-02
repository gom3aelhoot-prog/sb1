export default async function handler(req:any,res:any){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const provider=String(req.query?.provider||'').trim().toLowerCase();
  const q=String(req.query?.q||'').trim();
  if(!q) return res.status(400).json({error:'q is required'});
  try{
    if(provider==='youtube'){
      const key=process.env.YOUTUBE_API_KEY;
      if(!key) return res.status(503).json({error:'YOUTUBE_API_KEY is not configured'});
      const u=new URL('https://www.googleapis.com/youtube/v3/search');
      u.searchParams.set('part','snippet');u.searchParams.set('q',q);u.searchParams.set('type',String(req.query?.type||'video'));u.searchParams.set('maxResults','12');u.searchParams.set('key',key);
      const r=await fetch(u);const d=await r.json();
      if(!r.ok) return res.status(r.status).json({error:d?.error?.message||'YouTube API error'});
      return res.status(200).json({items:(d.items||[]).map((x:any)=>({id:x.id?.videoId||x.id?.channelId||x.id?.playlistId,title:x.snippet?.title||'',description:x.snippet?.description||'',channelTitle:x.snippet?.channelTitle||'',publishedAt:x.snippet?.publishedAt||'',thumbnail:x.snippet?.thumbnails?.medium?.url||x.snippet?.thumbnails?.default?.url||'',kind:x.id?.kind||''}))});
    }
    if(provider==='google_images'){
      const u=new URL('https://www.google.com/search');
      u.searchParams.set('q',q);u.searchParams.set('tbm','isch');u.searchParams.set('udm','2');u.searchParams.set('safe','active');u.searchParams.set('hl','en');u.searchParams.set('gl','us');u.searchParams.set('num','24');
      const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8','Accept-Language':'en-US,en;q=0.9'}});
      const html=await r.text();
      if(!r.ok)return res.status(r.status).json({items:[],error:'Google Images returned an error'});
      const normalized=html.replace(/\\u003d/gi,'=').replace(/\\u0026/gi,'&').replace(/&amp;/gi,'&').replace(/\\x3d/gi,'=').replace(/\\x26/gi,'&');
      const urls:string[]=[];
      const add=(value:string)=>{const v=value.replace(/\\u003d/gi,'=').replace(/\\u0026/gi,'&').replace(/\\x3d/gi,'=').replace(/\\x26/gi,'&').trim();if(/^https?:\/\//i.test(v))urls.push(v)};
      for(const m of normalized.matchAll(/https?:\/\/encrypted-tbn[0-9a-z-]+\.gstatic\.com\/images[^"'\\\s<>]+/gi))add(m[0]);
      for(const m of normalized.matchAll(/https?:\/\/[^"'\\\s<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"'\\\s<>]*)?/gi))add(m[0]);
      const unique=[...new Set(urls.map(x=>x.replace(/[),]+$/,'').trim()))].filter(x=>!x.includes('google.com/search')).slice(0,24);
      const items=unique.map((image:string,i:number)=>({id:'google-'+i+'-'+Buffer.from(image).toString('base64').slice(0,10),title:q+' — صورة '+(i+1),snippet:'Google Images',image,thumbnail:image,source:'Google Images',sourceUrl:'https://www.google.com/search?tbm=isch&udm=2&q='+encodeURIComponent(q)}));
      return res.status(200).json({items});
    }
    if(provider==='pinterest'){
      const token=process.env.PINTEREST_ACCESS_TOKEN, endpoint=process.env.PINTEREST_SEARCH_URL;
      if(!token||!endpoint) return res.status(503).json({error:'Pinterest API is not configured'});
      const u=new URL(endpoint);u.searchParams.set('q',q);u.searchParams.set('page_size','24');
      const r=await fetch(u,{headers:{Authorization:'Bearer '+token,Accept:'application/json'}});const d=await r.json();
      if(!r.ok) return res.status(r.status).json({error:d?.message||'Pinterest API error'});
      return res.status(200).json({items:(d.items||[]).map((x:any)=>({id:x.id,title:x.title||x.alt_text||'',description:x.description||'',image:x.media?.images?.['1200x']?.url||x.media?.images?.['600x']?.url||x.media?.images?.['400x300']?.url||'',url:x.link||'https://www.pinterest.com/pin/'+x.id+'/',author:x.board_owner?.username||''}))});
    }
    if(provider==='rutube'){
      const endpoint=process.env.RUTUBE_SEARCH_URL;if(!endpoint)return res.status(503).json({error:'Rutube API is not configured'});
      const u=new URL(endpoint);u.searchParams.set('query',q);u.searchParams.set('limit','24');
      const r=await fetch(u,{headers:{Accept:'application/json'}});const d=await r.json();if(!r.ok)return res.status(r.status).json({error:d?.message||'Rutube API error'});
      const rows=Array.isArray(d)?d:(d.results||d.items||[]);
      return res.status(200).json({items:rows.map((x:any)=>({id:x.id||x.video_id||x.pk,title:x.title||x.name||'',description:x.description||'',thumbnail:x.thumbnail_url||x.thumbnail||x.cover_url||'',url:x.url||x.webpage_url||'',author:x.author?.name||x.author||''}))});
    }
    if(provider==='ok'){
      const endpoint=process.env.OK_SEARCH_URL;if(!endpoint)return res.status(503).json({error:'OK API is not configured'});
      const u=new URL(endpoint);u.searchParams.set('query',q);u.searchParams.set('limit','24');
      const r=await fetch(u,{headers:{Accept:'application/json'}});const d=await r.json();if(!r.ok)return res.status(r.status).json({error:d?.error_msg||d?.message||'OK API error'});
      const rows=Array.isArray(d)?d:(d.results||d.items||[]);
      return res.status(200).json({items:rows.map((x:any)=>({id:x.id||x.video_id,title:x.title||x.name||'',description:x.description||'',thumbnail:x.thumbnail||x.image||'',url:x.url||x.link||'',author:x.author?.name||x.author||''}))});
    }
    if(provider==='yandex'){
      const endpoint=process.env.YANDEX_SEARCH_URL, token=process.env.YANDEX_SEARCH_TOKEN;
      if(!endpoint||!token)return res.status(503).json({error:'Yandex Search API is not configured'});
      const u=new URL(endpoint);u.searchParams.set('text',q);u.searchParams.set('limit','24');
      const r=await fetch(u,{headers:{Authorization:'Bearer '+token,Accept:'application/json'}});const d=await r.json();if(!r.ok)return res.status(r.status).json({error:d?.message||'Yandex API error'});
      const rows=d?.results||d?.items||d?.sites||[];
      return res.status(200).json({items:rows.map((x:any)=>({id:x.id||x.url,title:x.title||x.name||'',description:x.description||x.snippet||'',thumbnail:x.thumbnail||'',url:x.url||x.link||''}))});
    }
    return res.status(400).json({error:'Unsupported provider'});
  }catch(e){return res.status(500).json({items:[],error:e instanceof Error?e.message:'Search request failed'})}
}