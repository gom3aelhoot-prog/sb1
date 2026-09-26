import fs from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const SPECIALTIES_FILE = new URL('../src/lib/comprehensiveSpecialties.ts', import.meta.url);
const FEED_FILE = new URL('../public/library-feed.json', import.meta.url);
const DAY_MS = 24 * 60 * 60 * 1000;

function specialtiesFromTs(source) {
  const out = [];
  const re = /\{"slug":"([^"]+)","ar":"([^"]+)","en":"([^"]+)","de":"([^"]+)","ru":"([^"]+)"\}/g;
  let m;
  while ((m = re.exec(source))) out.push({ slug:m[1], ar:m[2], en:m[3], de:m[4], ru:m[5] });
  return out;
}

function pickBatch(items) {
  const hour = new Date().getUTCHours();
  const slots = [1,6,11,16,21];
  let slot = slots.reduce((best,h,i)=>Math.abs(h-hour)<Math.abs(slots[best]-hour)?i:best,0);
  const size = Math.ceil(items.length / 5);
  return items.slice(slot * size, (slot + 1) * size);
}

function clean(s='') { return String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }

async function epmc(specialty) {
  const q = encodeURIComponent('"' + specialty.en + '" AND OPEN_ACCESS:y');
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${q}&format=json&pageSize=4&resultType=lite&sort=P_PDATE_D%20desc`;
  const res = await fetch(url, {headers:{'User-Agent':'SB1-Library-Sync/1.0'}});
  if (!res.ok) throw new Error(`EuropePMC ${res.status}`);
  const json = await res.json();
  return (json.resultList?.result || []).map((x)=>({
    id:`epmc-${x.id}`,
    specialty_slug:specialty.slug,
    kind:'research',
    title:x.title || specialty.en,
    summary:clean(x.authorString ? `${x.authorString}. ${x.journalTitle || ''}` : ''),
    source:'Europe PMC',
    source_url:x.doi ? `https://doi.org/${x.doi}` : `https://europepmc.org/article/${x.source}/${x.id}`,
    language:'en',
    published_at:x.firstPublicationDate || x.firstPubDate || new Date().toISOString(),
    updated_at:new Date().toISOString()
  }));
}

async function who() {
  const url='https://www.who.int/rss-feeds/news-english.xml';
  try {
    const res=await fetch(url,{headers:{'User-Agent':'SB1-Library-Sync/1.0'}});
    if(!res.ok) return [];
    const xml=await res.text();
    const chunks=xml.split(/<item>/i).slice(1);
    return chunks.slice(0,20).map((c,i)=>{
      const get=(tag)=>clean((c.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,'i'))||[])[1]||'');
      return {id:`who-${i}-${Buffer.from(get('link')).toString('base64').slice(0,20)}`,kind:'who-news',title:get('title'),summary:get('description'),source:'WHO',source_url:get('link'),language:'en',published_at:get('pubDate')||new Date().toISOString(),updated_at:new Date().toISOString()};
    }).filter(x=>x.title&&x.source_url);
  } catch { return []; }
}

const specialties = specialtiesFromTs(await fs.readFile(SPECIALTIES_FILE,'utf8'));
const batch = pickBatch(specialties);
let items=[];
for (const specialty of batch) {
  try { items.push(...await epmc(specialty)); } catch (e) { console.error(specialty.slug,e.message); }
}
const whoItems=await who();
for (const item of whoItems) {
  const hay=(item.title+' '+item.summary).toLowerCase();
  const hit=specialties.find(s=>hay.includes(s.en.toLowerCase().split(' ')[0]) || hay.includes(s.en.toLowerCase()));
  items.push({...item,specialty_slug:hit?.slug || 'public-health'});
}
const old=JSON.parse(await fs.readFile(FEED_FILE,'utf8').catch(()=>'{"items":[]}'));
const map=new Map((old.items||[]).map(x=>[x.id,x]));
for(const item of items) map.set(item.id,item);
const cutoff=Date.now()-14*DAY_MS;
const merged=[...map.values()].filter(x=>new Date(x.published_at||x.updated_at).getTime()>=cutoff).sort((a,b)=>new Date(b.published_at||b.updated_at)-new Date(a.published_at||a.updated_at)).slice(0,1200);
await fs.writeFile(FEED_FILE,JSON.stringify({updated_at:new Date().toISOString(),refreshed_specialties:batch.map(x=>x.slug),items:merged},null,2)+'\\n');
console.log(`SB1 library sync: ${items.length} new records; ${merged.length} retained`);
