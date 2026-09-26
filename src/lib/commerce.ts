import { supabase } from '@/lib/supabase';

export type CommerceItem={item_type:string;item_id:string;name:string;image_url?:string|null;unit_price:number;currency_code?:string;quantity:number;metadata?:Record<string,any>};

export function accountKey(){
 if(typeof window==='undefined') return 'guest';
 return localStorage.getItem('sb1_account_key')||localStorage.getItem('sb1_account_email')||'guest';
}
export function getLocalCart():CommerceItem[]{try{return JSON.parse(localStorage.getItem('sb1_commerce_cart')||'[]')}catch{return[]}}
export function setLocalCart(v:CommerceItem[]){localStorage.setItem('sb1_commerce_cart',JSON.stringify(v));window.dispatchEvent(new Event('sb1-commerce-change'))}
export function addCart(item:CommerceItem){const c=getLocalCart();const i=c.findIndex(x=>x.item_type===item.item_type&&x.item_id===item.item_id);if(i>=0)c[i]={...c[i],quantity:c[i].quantity+item.quantity};else c.push(item);setLocalCart(c);return c}
export function removeCart(item_type:string,item_id:string){setLocalCart(getLocalCart().filter(x=>!(x.item_type===item_type&&x.item_id===item_id)))}
export function updateCart(item_type:string,item_id:string,quantity:number){const c=getLocalCart().map(x=>x.item_type===item_type&&x.item_id===item_id?{...x,quantity}:x).filter(x=>x.quantity>0);setLocalCart(c)}
export function getWishlist():CommerceItem[]{try{return JSON.parse(localStorage.getItem('sb1_wishlist')||'[]')}catch{return[]}}
export function toggleWishlist(item:CommerceItem){const c=getWishlist();const i=c.findIndex(x=>x.item_type===item.item_type&&x.item_id===item.item_id);if(i>=0)c.splice(i,1);else c.push({...item,quantity:1});localStorage.setItem('sb1_wishlist',JSON.stringify(c));window.dispatchEvent(new Event('sb1-commerce-change'));return c}
export function isWishlisted(type:string,id:string){return getWishlist().some(x=>x.item_type===type&&x.item_id===id)}

export async function syncCart(){
 const key=accountKey(); if(key==='guest') return;
 const c=getLocalCart(); for(const item of c){
   await supabase.from('sb1_cart_items').upsert({account_key:key,item_type:item.item_type,item_id:item.item_id,name:item.name,image_url:item.image_url||null,unit_price:item.unit_price,currency_code:item.currency_code||'USD',quantity:item.quantity,metadata:item.metadata||{},updated_at:new Date().toISOString()},{onConflict:'account_key,item_type,item_id'});
 }
}
export async function ensureWallet(){
 const key=accountKey();
 const {data}=await supabase.from('sb1_wallets').select('*').eq('account_key',key).maybeSingle();
 if(data) return data;
 const {data:created}=await supabase.from('sb1_wallets').insert({account_key:key,currency_code:'USD',balance:0,rewards_points:0}).select().single();
 return created||{account_key:key,currency_code:'USD',balance:0,rewards_points:0};
}
