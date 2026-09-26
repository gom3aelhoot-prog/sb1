import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/i18n/AppContext';
import { useI18n } from '@/lib/i18n';

function urlBase64ToUint8Array(base64String:string){const padding='='.repeat((4-base64String.length%4)%4);const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');const raw=window.atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));}

export default function PushNotifications(){
 const {country}=useApp();const {lang}=useI18n();
 useEffect(()=>{let cancelled=false;
  const setup=async()=>{if(cancelled||typeof window==='undefined'||!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window))return;
   try{
    const reg=await navigator.serviceWorker.register('/sw.js');
    if(Notification.permission!=='granted')return;
    const key=import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if(!key)return;
    let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(key)});
    const json=sub.toJSON();
    if(json.endpoint&&json.keys?.p256dh&&json.keys?.auth){
      await supabase.from('push_subscriptions').upsert({endpoint:json.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth,language_code:lang,country_code:country.code,updated_at:new Date().toISOString()},{onConflict:'endpoint'});
    }
   }catch{}
  };setup();return()=>{cancelled=true}},[country.code,lang]);
 return null;
}
