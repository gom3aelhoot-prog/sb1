import { supabase } from '@/lib/supabase';
import { ARAB_COUNTRIES, CURRENCY_RATES, type CountryInfo } from '@/types/i18n';

export type ServiceType='question'|'session'|'course'|'test'|'subscription'|'facility_booking'|'pharmacy_delivery'|'book'|'audio'|'video';

const baseUsd:Record<ServiceType,number>={question:9,session:25,course:19,test:5,subscription:9.99,facility_booking:15,pharmacy_delivery:4,book:8,audio:3,video:6};
const countryMultiplier:Record<string,number>={SA:1,AE:1.05,EG:.78,IQ:.78,JO:.88,KW:1.08,LB:.55,LY:.66,MA:.66,OM:1.05,PS:.88,QA:1.02,SY:.55,TN:.66,YE:.55,DZ:.66,BH:1.04,MR:.55,SD:.55,SO:.55,KM:.55,DJ:.55};

export function fallbackServicePrice(country:CountryInfo,service:ServiceType){
 const usd=Number((baseUsd[service]*(countryMultiplier[country.code]||.75)).toFixed(2));
 const rate=CURRENCY_RATES[country.currency]||1;
 return {price_usd:usd,local_price:Number((usd*rate).toFixed(2)),currency_code:country.currency,currency_symbol:country.currencySymbol};
}

export async function getCountryServicePrice(country:CountryInfo,service:ServiceType){
 const fallback=fallbackServicePrice(country,service);
 try{
   const {data}=await supabase.from('country_service_prices').select('price_usd,local_price,currency_code,currency_symbol').eq('country_code',country.code).eq('service_type',service).maybeSingle();
   return data||fallback;
 }catch{return fallback}
}

export function allCountryOptions(){return ARAB_COUNTRIES;}
