import { createClient } from '@supabase/supabase-js';

function send(res:any,body:unknown,status=200){res.statusCode=status;res.setHeader('content-type','application/json');res.end(JSON.stringify(body));}
export default async function handler(req:any,res:any){
 if(req.method!=='POST')return send(res,{error:'Method not allowed'},405);
 const url=process.env.VITE_SUPABASE_URL||process.env.SUPABASE_URL;
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
 const anon=process.env.VITE_SUPABASE_ANON_KEY;
 if(!url||!secret||!anon)return send(res,{error:'Server provisioning is not configured. Add SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY).'},503);
 try{
  const authHeader=String(req.headers?.authorization||'');const token=authHeader.replace(/^Bearer\s+/i,'');
  if(!token)return send(res,{error:'Authorization required'},401);
  const client=createClient(url,anon,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:{user:actor},error:authError}=await client.auth.getUser(token);
  if(authError||!actor)return send(res,{error:'Invalid owner session'},401);
  const admin=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:grant}=await admin.from('admin_role_grants').select('role').eq('user_id',actor.id).eq('is_active',true).maybeSingle();
  if(grant?.role!=='owner')return send(res,{error:'OWNER_FORBIDDEN'},403);
  const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
  if(!body.email||!body.password||String(body.password).length<10)return send(res,{error:'Email and a password of at least 10 characters are required.'},400);
  const {data,error}=await admin.auth.admin.createUser({email:String(body.email).trim().toLowerCase(),password:String(body.password),email_confirm:true,user_metadata:{name:body.display_name||'',account_type:body.account_type||'other',owner_created:true}});
  if(error||!data.user)return send(res,{error:error?.message||'Could not create user'},400);
  const {error:grantError}=await admin.from('owner_account_exceptions').insert({user_id:data.user.id,email:data.user.email,account_type:body.account_type||'other',display_name:body.display_name||'',skip_contracts:body.skip_contracts!==false,skip_document_verification:body.skip_document_verification!==false,skip_digital_signature:body.skip_digital_signature!==false,active:true,notes:body.notes||'Created directly by owner; administrative exception.',granted_by:actor.id});
  if(grantError)return send(res,{warning:'User created but exception record failed',user_id:data.user.id,error:grantError.message},207);
  return send(res,{ok:true,user_id:data.user.id,email:data.user.email});
 }catch(e){return send(res,{error:e instanceof Error?e.message:'Provisioning failed'},500);}
}