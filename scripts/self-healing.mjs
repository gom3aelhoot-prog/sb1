import process from 'node:process';
const base=(process.env.SB1_PUBLIC_URL||'').replace(/\/$/,'');if(!base){console.error('SB1_PUBLIC_URL is required');process.exit(2)}
const timeout=Number(process.env.SB1_HEALTH_TIMEOUT_MS||15000);
async function get(path){const c=new AbortController();const t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(base+path,{signal:c.signal});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text.slice(0,500)}return{status:r.status,data}}finally{clearTimeout(t)}}
const health=await get('/api/health');console.log(JSON.stringify({health},null,2));if(health.status>=500){console.error('SB1 health check failed');process.exit(1)}console.log('SB1 self-healing health check passed');
