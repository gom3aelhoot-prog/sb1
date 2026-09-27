export type Provider = { name:string; url:string; timeoutMs?:number; headers?:Record<string,string>; enabled?:boolean };
export type ProbeResult = {name:string;url:string;ok:boolean;status?:number;latency_ms:number;error?:string};
const breakers = new Map<string,{failures:number;openUntil:number}>();
const now=()=>Date.now();
export async function fetchWithTimeout(input:RequestInfo|URL,init:RequestInit={},timeoutMs=8000){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{return await fetch(input,{...init,signal:controller.signal});}finally{clearTimeout(timer);}
}
export async function probeProvider(p:Provider):Promise<ProbeResult>{
 const started=now();if(!p.enabled)return{name:p.name,url:p.url,ok:false,latency_ms:0,error:'disabled'};
 try{const r=await fetchWithTimeout(p.url,{method:'GET',headers:p.headers},p.timeoutMs??6000);return{name:p.name,url:p.url,ok:r.ok,status:r.status,latency_ms:now()-started,error:r.ok?undefined:`HTTP ${r.status}`};}
 catch(e){return{name:p.name,url:p.url,ok:false,latency_ms:now()-started,error:e instanceof Error?e.message:String(e)};}
}
export async function probeProviders(providers:Provider[]){return Promise.all(providers.filter(p=>p.url).map(probeProvider));}
export async function resilientFetch(primary:Provider,fallback:Provider|undefined,init:RequestInit={},timeoutMs=10000){
 const key=primary.name;const b=breakers.get(key);if(b&&b.openUntil>now()&&fallback?.url)return fetchWithTimeout(fallback.url,init,timeoutMs);
 try{const r=await fetchWithTimeout(primary.url,init,timeoutMs);if(r.ok){breakers.delete(key);return r;}throw new Error(`Primary ${primary.name} returned HTTP ${r.status}`);}
 catch(primaryError){const next=breakers.get(key)||{failures:0,openUntil:0};next.failures++;if(next.failures>=2)next.openUntil=now()+60000;breakers.set(key,next);if(fallback?.url)return fetchWithTimeout(fallback.url,init,timeoutMs);throw primaryError;}
}
export function providerConfig(env:Record<string,string|undefined>){
 return {payments:[{name:'stripe-primary',url:env.STRIPE_HEALTH_URL||'https://api.stripe.com/v1',enabled:!!env.STRIPE_SECRET_KEY},{name:'payments-fallback',url:env.SB1_PAYMENT_FALLBACK_URL||'',enabled:!!env.SB1_PAYMENT_FALLBACK_URL}],avatars:[{name:'avatar-primary',url:env.SB1_AVATAR_API_URL||'',enabled:!!env.SB1_AVATAR_API_URL},{name:'avatar-fallback',url:env.SB1_AVATAR_FALLBACK_URL||'',enabled:!!env.SB1_AVATAR_FALLBACK_URL}],identity:[{name:'identity-primary',url:env.SB1_IDENTITY_API_URL||'',enabled:!!env.SB1_IDENTITY_API_URL},{name:'identity-fallback',url:env.SB1_IDENTITY_FALLBACK_URL||'',enabled:!!env.SB1_IDENTITY_FALLBACK_URL}]} as const;
}
