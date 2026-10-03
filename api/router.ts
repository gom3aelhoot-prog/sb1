export default async function handler(req:any,res:any){
  const url=new URL(req.url||'/', 'https://sb1.local');
  const path=url.pathname;
  const q=url.searchParams.get('q')||'';const job=url.searchParams.get('job')||'';
  res.setHeader('Content-Type','application/json');
  try{
    if(job==='publish-scheduled'){
      const base=process.env.VITE_SUPABASE_URL||process.env.SUPABASE_URL;
      const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
      if(!base||!key) return res.status(200).json({status:'ok',published:0,reason:'Supabase service role not configured'});
      const now=new Date().toISOString();
      const due=await fetch(base+'/rest/v1/sb1_scheduled_posts?status=eq.scheduled&scheduled_at=lte.'+encodeURIComponent(now)+'&select=*',{headers:{apikey:key,Authorization:'Bearer '+key}});
      const items=await due.json();
      let published=0;
      for(const item of Array.isArray(items)?items:[]){
        const ins=await fetch(base+'/rest/v1/sb1_page_posts',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({page_id:item.page_id,kind:item.post_type,body:item.body||'',media_url:item.media_url,is_public:true,created_at:item.scheduled_at})});
        if(ins.ok){await fetch(base+'/rest/v1/sb1_scheduled_posts?id=eq.'+item.id,{method:'PATCH',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({status:'published',published_at:new Date().toISOString()})});published++;}
      }
      return res.status(200).json({status:'ok',published});
    }
    if(path.endsWith('/health')) return res.status(200).json({status:'ok',service:'SB1 system'});
    if(path.endsWith('/monitor')) return res.status(200).json({status:'active',monitor:true});
    if(path.endsWith('/youtube-search')){
      if(!q.trim()) return res.status(200).json({items:[]});
      const key=process.env.YOUTUBE_API_KEY;
      if(key){
        const r=await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=24&videoSyndicated=true&q='+encodeURIComponent(q)+'&key='+encodeURIComponent(key));
        const x=await r.json();
        if(!r.ok) throw new Error(x?.error?.message||'YouTube server returned an invalid response');
        return res.status(200).json({items:(x.items||[]).map((i:any)=>({id:i.id?.videoId,title:i.snippet?.title||'',description:i.snippet?.description||'',channelTitle:i.snippet?.channelTitle||'',thumbnail:i.snippet?.thumbnails?.high?.url||i.snippet?.thumbnails?.medium?.url||'',url:'https://www.youtube.com/watch?v='+i.id?.videoId,embedUrl:'https://www.youtube-nocookie.com/embed/'+i.id?.videoId}))});
      }
      const base=process.env.PIPED_API_URL||'https://pipedapi.kavin.rocks';
      const r=await fetch(base+'/search?q='+encodeURIComponent(q)+'&filter=videos');
      if(!r.ok) throw new Error('YouTube search is temporarily unavailable.');
      const x=await r.json();
      return res.status(200).json({items:(x.items||[]).slice(0,24).map((i:any)=>{const id=(String(i.url||'').match(/v=([^&]+)/)||[])[1]||String(i.url||'').split('v=').pop();return {id,title:i.title||'',description:i.description||'',channelTitle:i.uploaderName||i.uploader||'',thumbnail:i.thumbnail||'',url:'https://www.youtube.com/watch?v='+id,embedUrl:'https://www.youtube-nocookie.com/embed/'+id}})});
    }
    if(path.endsWith('/social-search')){
      const provider=url.searchParams.get('provider')||'';
      if(provider==='google_images'){
        const r=await fetch('https://api.openverse.org/v1/images/?q='+encodeURIComponent(q)+'&page_size=40');
        if(!r.ok) throw new Error('Image search unavailable');
        const x=await r.json();
        return res.status(200).json({items:(x.results||[]).map((i:any)=>({id:i.id||i.foreign_landing_url,image:i.thumbnail||i.url,thumbnail:i.thumbnail||i.url,title:i.title||q,source:i.creator||i.provider||'Openverse',url:i.foreign_landing_url||i.url}))});
      }
      if(provider==='audio'){
        const r=await fetch('https://api.openverse.org/v1/audio/?q='+encodeURIComponent(q)+'&page_size=40');
        if(!r.ok) throw new Error('Audio search unavailable');
        const x=await r.json();
        return res.status(200).json({items:(x.results||[]).map((i:any)=>({id:i.id||i.foreign_landing_url,title:i.title||q,url:i.url,thumbnail:i.thumbnail||'',source:i.creator||i.provider||'Openverse',kind:'audio'}))});
      }
      return res.status(200).json({items:[]});
    }
    if(path.endsWith('/media-library')) return res.status(200).json({items:[]});
    if(path.endsWith('/music-search')) return res.status(200).json({items:[]});
    if(path.endsWith('/wallet')||path.endsWith('/marketing')) return res.status(200).json({status:'ready'});
    return res.status(404).json({error:'API route not found',path});
  }catch(error:any){return res.status(502).json({error:error?.message||'SB1 API error'});}
}