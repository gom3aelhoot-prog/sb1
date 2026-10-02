export default async function handler(req:any,res:any){
  const kind=String(req.query.kind||'images');
  const q=String(req.query.q||'').trim();
  const defaults={
    images:'medical medicine hospital anatomy nature landscape technology science education architecture food travel sports animals books laboratory',
    gif:'hug happiness people good agreement love celebration reaction',
    sticker:'hug happiness people good agreement love celebration medical',
    audio:'music ambient piano calm happy sad instrumental meditation'
  } as any;
  const base=q||defaults[kind]||defaults.images;
  const mime=kind==='gif'?' filemime:image/gif':kind==='audio'?' filemime:audio/mpeg OR filemime:audio/ogg OR filemime:audio/wav OR filemime:audio/flac':kind==='sticker'?' filemime:image/png OR filemime:image/webp':' filemime:image/jpeg OR filemime:image/png OR filemime:image/webp';
  const query=base+' '+mime;
  try{
    const pages=await Promise.all([0,500,1000,1500].map(async offset=>{
      const u=new URL('https://commons.wikimedia.org/w/api.php');
      u.searchParams.set('action','query');u.searchParams.set('format','json');u.searchParams.set('origin','*');
      u.searchParams.set('generator','search');u.searchParams.set('gsrnamespace','6');u.searchParams.set('gsrsearch',query);u.searchParams.set('gsrlimit','500');u.searchParams.set('gsroffset',String(offset));
      u.searchParams.set('prop','imageinfo');u.searchParams.set('iiprop','url|mime|mediatype');u.searchParams.set('iiurlwidth','500');
      const r=await fetch(u.toString(),{headers:{'User-Agent':'SB1-MediaPublisher/1.0'}});
      if(!r.ok)return [];
      const x=await r.json();return Object.values(x?.query?.pages||{}) as any[];
    }));
    const items=pages.flat().map((p:any)=>{
      const info=p.imageinfo?.[0]||{};const mime=String(info.mime||'');const isAudio=mime.startsWith('audio/');const isGif=mime==='image/gif';
      return {id:'commons-'+p.pageid,name:String(p.title||'').replace(/^File:/,''),url:info.url||'',thumbnail:info.thumburl||info.url||'',kind:isAudio?'audio':isGif?'gif':kind==='sticker'?'sticker':'image',source:'Wikimedia Commons',license:'CC/Commons — راجع صفحة الملف',duration:0};
    }).filter((x:any)=>x.url);
    const unique=[...new Map(items.map((x:any)=>[x.id,x])).values()].slice(0,2000);
    return res.status(200).json({items:unique,count:unique.length,source:'Wikimedia Commons'});
  }catch(e:any){return res.status(500).json({items:[],error:e?.message||'Media library failed'});}
}