export default async function handler(req:any,res:any){
  const url=new URL(req.url||'/', 'https://sb1.local');const path=url.pathname;const q=url.searchParams.get('q')||'';const job=url.searchParams.get('job')||'';
  res.setHeader('Content-Type','application/json');
  try{
    if(job==='publish-scheduled')return res.status(200).json({status:'ok',published:0,reason:'Scheduled publishing is handled by SB1 client state on Hobby plan.'});
    if(path.endsWith('/health'))return res.status(200).json({status:'ok',service:'SB1 system'});
    if(path.endsWith('/monitor'))return res.status(200).json({status:'active',monitor:true});
    if(path.endsWith('/youtube-search')){
      if(!q.trim())return res.status(200).json({items:[]});
      const key=process.env.YOUTUBE_API_KEY;
      if(key){const r=await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=24&videoSyndicated=true&q='+encodeURIComponent(q)+'&key='+encodeURIComponent(key));const x=await r.json();if(!r.ok)throw new Error(x?.error?.message||'YouTube server returned an invalid response');return res.status(200).json({items:(x.items||[]).map((i:any)=>({id:i.id?.videoId,title:i.snippet?.title||'',description:i.snippet?.description||'',channelTitle:i.snippet?.channelTitle||'',thumbnail:i.snippet?.thumbnails?.high?.url||i.snippet?.thumbnails?.medium?.url||'',url:'https://www.youtube.com/watch?v='+i.id?.videoId,embedUrl:'https://www.youtube-nocookie.com/embed/'+i.id?.videoId}))});}
      const base=process.env.PIPED_API_URL||'https://pipedapi.kavin.rocks';const r=await fetch(base+'/search?q='+encodeURIComponent(q)+'&filter=videos');if(!r.ok)throw new Error('YouTube search is temporarily unavailable.');const x=await r.json();return res.status(200).json({items:(x.items||[]).slice(0,24).map((i:any)=>{const id=(String(i.url||'').match(/v=([^&]+)/)||[])[1]||String(i.url||'').split('v=').pop();return{id,title:i.title||'',description:i.description||'',channelTitle:i.uploaderName||i.uploader||'',thumbnail:i.thumbnail||'',url:'https://www.youtube.com/watch?v='+id,embedUrl:'https://www.youtube-nocookie.com/embed/'+id}})});
    }
    if(path.endsWith('/social-search')){
      const provider=url.searchParams.get('provider')||'';
      if(provider==='google_images'){
        const serper=process.env.SERPER_API_KEY||process.env.SERPER_KEY;
        if(serper){const r=await fetch('https://google.serper.dev/images',{method:'POST',headers:{'X-API-KEY':serper,'Content-Type':'application/json'},body:JSON.stringify({q,num:40,safe:'active'})});const x=await r.json();if(!r.ok)throw new Error(x?.message||'Serper Google Images returned an invalid response');return res.status(200).json({items:(x.images||[]).map((i:any)=>({id:i.imageUrl||i.link,title:i.title||q,image:i.imageUrl||i.thumbnailUrl,thumbnail:i.thumbnailUrl||i.imageUrl,url:i.link||i.imageUrl,source:i.source||'Google Images'}))});}
        const r=await fetch('https://api.openverse.org/v1/images/?q='+encodeURIComponent(q)+'&page_size=40');if(!r.ok)throw new Error('Google Images search unavailable: configure SERPER_API_KEY.');const x=await r.json();return res.status(200).json({items:(x.results||[]).map((i:any)=>({id:i.id||i.foreign_landing_url,image:i.thumbnail||i.url,thumbnail:i.thumbnail||i.url,title:i.title||q,source:i.creator||i.provider||'Openverse',url:i.foreign_landing_url||i.url}))});
      }
      if(provider==='pixabay_images'){
        const key=process.env.PIXABAY_API_KEY;
        if(!key)throw new Error('PIXABAY_API_KEY is not configured.');
        const r=await fetch('https://pixabay.com/api/?key='+encodeURIComponent(key)+'&q='+encodeURIComponent(q)+'&image_type=all&safesearch=true&per_page=40');
        const x=await r.json(); if(!r.ok)throw new Error(x?.error||'Pixabay image search failed');
        return res.status(200).json({items:(x.hits||[]).map((i:any)=>({id:'pixabay-'+i.id,title:i.tags||'Pixabay',image:i.webformatURL||i.largeImageURL,thumbnail:i.previewURL||i.webformatURL,url:i.pageURL,source:'Pixabay',license:'Pixabay Content License'}))});
      }
      if(provider==='audio'){const r=await fetch('https://api.openverse.org/v1/audio/?q='+encodeURIComponent(q)+'&page_size=40');if(!r.ok)throw new Error('Audio search unavailable');const x=await r.json();return res.status(200).json({items:(x.results||[]).map((i:any)=>({id:i.id||i.foreign_landing_url,title:i.title||q,url:i.url,thumbnail:i.thumbnail||'',source:i.creator||i.provider||'Openverse',kind:'audio',duration:Number(i.duration||0)}))});}
      if(provider==='gif'){
        const key=process.env.GIPHY_API_KEY||process.env.GIPHY_KEY;
        if(!key)throw new Error('GIPHY_API_KEY is not configured for GIF search.');
        const r=await fetch('https://api.giphy.com/v1/gifs/search?api_key='+encodeURIComponent(key)+'&q='+encodeURIComponent(q||'trending')+'&limit=50&rating=pg-13');const x=await r.json();if(!r.ok)throw new Error(x?.meta?.msg||'GIPHY search failed');
        return res.status(200).json({items:(x.data||[]).map((i:any)=>({id:i.id,name:i.title||'GIF',url:i.images?.original?.url||i.images?.fixed_height?.url,thumbnail:i.images?.fixed_width_small?.url||i.images?.fixed_height_small?.url,kind:'gif',source:'GIPHY'}))});
      }
      if(provider==='sticker'){
        const key=process.env.GIPHY_API_KEY||process.env.GIPHY_KEY;
        if(!key)throw new Error('GIPHY_API_KEY is not configured for Sticker search.');
        const r=await fetch('https://api.giphy.com/v1/stickers/search?api_key='+encodeURIComponent(key)+'&q='+encodeURIComponent(q||'stickers')+'&limit=50&rating=pg-13');const x=await r.json();if(!r.ok)throw new Error(x?.meta?.msg||'GIPHY sticker search failed');
        return res.status(200).json({items:(x.data||[]).map((i:any)=>({id:i.id,name:i.title||'Sticker',url:i.images?.original?.url||i.images?.fixed_height?.url,thumbnail:i.images?.fixed_width_small?.url||i.images?.fixed_height_small?.url,kind:'sticker',source:'GIPHY'}))});
      }
      return res.status(200).json({items:[]});
    }
    if(path.endsWith('/library-sync')){
      const kind=url.searchParams.get('kind')||'image'; const pageId=url.searchParams.get('page_id')||'sb1';
      const sb=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL; const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
      if(!sb||!service) return res.status(503).json({error:'Supabase service role is not configured.'});
      const headers={'apikey':service,'Authorization':'Bearer '+service,'Content-Type':'application/json','Prefer':'return=minimal'};
      const rows:any[]=[];
      if(kind==='image'||kind==='audio'){
        const endpoint=kind==='image'?'https://api.openverse.org/v1/images/':'https://api.openverse.org/v1/audio/';
        const pages=Array.from({length:20},(_,i)=>i+1);
        const responses=await Promise.all(pages.map(p=>fetch(endpoint+'?q='+encodeURIComponent(q|| (kind==='image'?'nature':'music'))+'&page_size=100&page='+p)));
        for(const rr of responses){if(!rr.ok)continue;const x=await rr.json();for(const i of (x.results||[])){const u=i.url||i.thumbnail;if(!u)continue;rows.push({page_id:pageId,kind:kind==='audio'?'music':'image',name:i.title|| (kind==='image'?'صورة':'موسيقى'),url:u,thumbnail_url:i.thumbnail||null,source:i.creator||i.provider||'Openverse',tags:[kind,'openverse'],metadata:{duration:Number(i.duration||0)}});}}
      }else if(kind==='gif'||kind==='sticker'){
        const key=process.env.GIPHY_API_KEY||process.env.GIPHY_KEY;if(!key)throw new Error('GIPHY_API_KEY is not configured.');
        const endpoint=kind==='gif'?'gifs':'stickers';const offsets=Array.from({length:40},(_,i)=>i*50);
        const responses=await Promise.all(offsets.map(offset=>fetch('https://api.giphy.com/v1/'+endpoint+'/search?api_key='+encodeURIComponent(key)+'&q='+encodeURIComponent(q||kind)+'&limit=50&offset='+offset+'&rating=pg-13')));
        for(const rr of responses){if(!rr.ok)continue;const x=await rr.json();for(const i of (x.data||[])){const u=i.images?.original?.url||i.images?.fixed_height?.url;if(!u)continue;rows.push({page_id:pageId,kind,name:i.title||kind,url:u,thumbnail_url:i.images?.fixed_width_small?.url||null,source:'GIPHY',tags:[kind,'giphy'],metadata:{}});}}
      }else return res.status(400).json({error:'Unsupported library kind'});
      const unique=Array.from(new Map(rows.map(x=>[x.url,x])).values()).slice(0,2000);
      for(let i=0;i<unique.length;i+=100){const batch=unique.slice(i,i+100);await fetch(sb+'/rest/v1/sb1_creator_library',{method:'POST',headers,body:JSON.stringify(batch)});}
      return res.status(200).json({ok:true,kind,count:unique.length});
    }
    if(path.endsWith('/media-library'))return res.status(200).json({items:[]});
    if(path.endsWith('/music-search'))return res.status(200).json({items:[]});
    if(path.endsWith('/wallet')||path.endsWith('/marketing'))return res.status(200).json({status:'ready'});
    return res.status(404).json({error:'API route not found',path});
  }catch(error:any){return res.status(502).json({error:error?.message||'SB1 API error'});}
}