import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export default {
  async fetch(req: Request) {
    if (req.method !== 'POST') return Response.json({error:'Method not allowed'},{status:405});
    const payload = await req.json();
    const record = payload.record || payload;
    if (!record?.title || !record?.body) return Response.json({error:'Invalid notification payload'},{status:400});
    const publicKey=Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey=Deno.env.get('VAPID_PRIVATE_KEY');
    const subject=Deno.env.get('VAPID_SUBJECT');
    if(!publicKey||!privateKey||!subject) return Response.json({error:'VAPID secrets are not configured'},{status:503});
    webpush.setVapidDetails(subject,publicKey,privateKey);
    const query=supabase.from('push_subscriptions').select('endpoint,p256dh,auth').limit(500);
    if(record.user_id) query.eq('user_id',record.user_id);
    if(record.language_code) query.eq('language_code',record.language_code);
    const {data:subs,error}=await query;
    if(error) return Response.json({error:error.message},{status:500});
    const results=await Promise.all((subs||[]).map(async sub=>{
      try{await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify({title:record.title,body:record.body,url:record.reference_id?'/questions/'+record.reference_id:'/notifications'}));return {endpoint:sub.endpoint,ok:true};}
      catch(e){return {endpoint:sub.endpoint,ok:false,error:e instanceof Error?e.message:String(e)};}
    }));
    return Response.json({ok:true,sent:results.filter(x=>x.ok).length,total:results.length,results});
  }
};
