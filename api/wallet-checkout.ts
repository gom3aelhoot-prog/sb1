export default async function handler(req:any,res:any){
 if(req.method!=='POST')return send(res,{error:'Method not allowed'},405);
 const action=String(req.query?.action||'checkout');
 const secret=process.env.STRIPE_SECRET_KEY;
 if(!secret)return send(res,{error:'Stripe is not configured'},503);
 try{
  const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
  if(action==='confirm'){
   const supabaseUrl=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
   const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
   if(!supabaseUrl||!service)return send(res,{error:'Wallet server integration is not configured'},503);
   if(!b.session_id)return send(res,{error:'Missing session'},400);
   const sr=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(b.session_id),{headers:{Authorization:'Bearer '+secret}});
   const s=await sr.json();
   if(!sr.ok||s.payment_status!=='paid'||s.metadata?.type!=='wallet_topup')return send(res,{error:'Payment not verified'},400);
   const amount=Number(s.amount_total||0)/100;
   const key=String(s.metadata.account_key||'');
   if(!key||!amount)return send(res,{error:'Invalid payment metadata'},400);
   const headers={'apikey':service,'Authorization':'Bearer '+service,'Content-Type':'application/json','Prefer':'return=representation'};
   const rpc=await fetch(supabaseUrl+'/rest/v1/rpc/sb1_wallet_credit',{method:'POST',headers,body:JSON.stringify({p_account_key:key,p_amount:amount,p_currency:String(s.currency||'usd').toUpperCase(),p_reference_type:'stripe_checkout',p_reference_id:s.id,p_description:'Wallet top up'})});
   const result=await rpc.json();
   if(!rpc.ok)return send(res,{error:result?.message||'Wallet update failed'},500);
   return send(res,{ok:true,balance:result?.balance||0,amount,session_id:s.id,duplicate:!!result?.duplicate});
  }
  const amount=Number(b.amount);
  const accountKey=String(b.account_key||'').trim();
  if(!amount||amount<=0||!accountKey)return send(res,{error:'Invalid wallet top-up'},400);
  const origin=req.headers?.origin||process.env.SB1_PUBLIC_URL||'http://localhost:5173';
  const ref='wallet-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  const p=new URLSearchParams();
  p.set('mode','payment');p.set('line_items[0][quantity]','1');
  p.set('line_items[0][price_data][currency]',String(b.currency||'usd').toLowerCase());
  p.set('line_items[0][price_data][unit_amount]',String(Math.round(amount*100)));
  p.set('line_items[0][price_data][product_data][name]','SB1 Wallet Top Up');
  p.set('success_url',origin+'/wallet?topup=success&session_id={CHECKOUT_SESSION_ID}');
  p.set('cancel_url',origin+'/wallet?topup=cancelled');
  p.set('metadata[reference_id]',ref);p.set('metadata[account_key]',accountKey);p.set('metadata[type]','wallet_topup');
  const sr=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+secret,'Content-Type':'application/x-www-form-urlencoded'},body:p.toString()});
  const data=await sr.json();
  if(!sr.ok)return send(res,{error:data?.error?.message||'Stripe checkout failed'},sr.status);
  return send(res,{url:data.url,id:data.id,reference_id:ref});
 }catch(e){return send(res,{error:e instanceof Error?e.message:'Wallet request failed'},500)}
}
function send(res:any,b:any,s=200){res.statusCode=s;res.setHeader('content-type','application/json');res.end(JSON.stringify(b));}
