import { supabase } from '@/lib/supabase';

export type NotificationScope = 'global' | 'private';
export type NotificationKind = 'community'|'content'|'facility'|'news'|'question'|'booking'|'wallet'|'account'|'message';

export type NotificationItem = {
 id:string; scope:NotificationScope; kind:NotificationKind; title:string; body:string;
 created_at:string; read?:boolean; href?:string; user_id?:string|null; language_code?:string;
};

const tr=(lang:string, map:Record<string,string>)=>map[lang]||map.en||map.ar;

export function demoGlobalNotifications(lang:string):NotificationItem[]{
 const now=Date.now();
 const items=[
  {kind:'question' as const,title:tr(lang,{ar:'دكتور جمال نادي أجاب عن سؤال جديد',en:'Dr. James answered a new question',ru:'Доктор Джеймс ответил на новый вопрос',de:'Dr. James beantwortete eine neue Frage'}),body:tr(lang,{ar:'ما أعراض التوحد؟ يمكنك فتح السؤال وقراءة الإجابات.',en:'What are the symptoms of autism? Open the question to read the answers.',ru:'Каковы симптомы аутизма? Откройте вопрос, чтобы прочитать ответы.',de:'Was sind die Symptome von Autismus? Öffnen Sie die Frage für Antworten.'}),href:'/questions',mins:4},
  {kind:'facility' as const,title:tr(lang,{ar:'صيدلية الإيمان أضافت منتجات جديدة',en:'Al-Iman Pharmacy added new products',ru:'Аптека Al-Iman добавила новые товары',de:'Al-Iman Apotheke hat neue Produkte hinzugefügt'}),body:tr(lang,{ar:'تصفح المنتجات والخدمات المتاحة.',en:'Browse the available products and services.',ru:'Просмотрите доступные товары и услуги.',de:'Entdecken Sie verfügbare Produkte und Leistungen.'}),href:'/store',mins:19},
  {kind:'news' as const,title:tr(lang,{ar:'خبر طبي وصحي جديد اليوم',en:'New medical and health update today',ru:'Сегодня новое медицинское обновление',de:'Neue medizinische Gesundheitsmeldung heute'}),body:tr(lang,{ar:'تم تحديث موجز الأخبار الصحية في المنصة.',en:'The health news feed has been updated.',ru:'Лента медицинских новостей обновлена.',de:'Der Gesundheits-Newsfeed wurde aktualisiert.'}),href:'/media',mins:43},
  {kind:'community' as const,title:tr(lang,{ar:'نشاط جديد في مجتمع SB1',en:'New SB1 community activity',ru:'Новая активность сообщества SB1',de:'Neue SB1-Community-Aktivität'}),body:tr(lang,{ar:'انضمام أخصائيين ومحتوى جديد للقراءة والمشاهدة.',en:'New specialists and content are available.',ru:'Доступны новые специалисты и материалы.',de:'Neue Spezialisten und Inhalte sind verfügbar.'}),href:'/community',mins:78},
 ];
 return items.map((x,i)=>({id:`global-demo-${i}`,scope:'global',kind:x.kind,title:x.title,body:x.body,href:x.href,created_at:new Date(now-x.mins*60000).toISOString(),read:false,language_code:lang})) as NotificationItem[];
}

export function demoPrivateNotifications(lang:string,userId:string):NotificationItem[]{
 const now=Date.now();
 const text=lang==='ru'?{wallet:'На ваш цифровой кошелёк успешно начислены баллы',booking:'Клиент «Анонимный клиент» забронировал видеосессию',account:'Администрация обновила статус вашей учётной записи'}:
 lang==='en'?{wallet:'New points were added to your digital wallet',booking:'Anonymous client booked a video session with you',account:'Administration updated your account status'}:
 {wallet:'تمت إضافة نقاط جديدة إلى محفظتك الرقمية بنجاح',booking:'العميل «اسم مجهول» قام بحجز جلسة فيديو لديك',account:'قامت الإدارة بتحديث حالة حسابك'};
 return [
  {id:`private-${userId}-1`,scope:'private',kind:'wallet',title:text.wallet,body:lang==='ar'?'تم تسجيل العملية في سجل المحفظة.': 'The transaction was recorded in your wallet ledger.',created_at:new Date(now-8*60000).toISOString(),read:false,href:'/wallet',user_id:userId},
  {id:`private-${userId}-2`,scope:'private',kind:'booking',title:text.booking,body:lang==='ar'?'اليوم · 18:30 · جلسة فيديو خاصة.': 'Today · 18:30 · Private video session.',created_at:new Date(now-31*60000).toISOString(),read:false,href:'/specialist-appointments',user_id:userId},
  {id:`private-${userId}-3`,scope:'private',kind:'account',title:text.account,body:lang==='ar'?'يمكنك مراجعة سجل الأمان من مركز الأمان.':'Review the security history in Safety Center.',created_at:new Date(now-3*3600000).toISOString(),read:true,href:'/safety',user_id:userId},
 ].map(x=>({...x,language_code:lang}));
}

export async function loadGlobalNotifications(lang:string){
 try{const {data,error}=await supabase.from('global_notifications').select('*').eq('language_code',lang).order('created_at',{ascending:false}).limit(50);if(!error&&data?.length)return data as NotificationItem[];}catch{}
 return demoGlobalNotifications(lang);
}

export async function loadPrivateNotifications(lang:string,userId:string){
 try{const {data,error}=await supabase.from('private_notifications').select('*').eq('user_id',userId).order('created_at',{ascending:false}).limit(50);if(!error&&data?.length)return data as NotificationItem[];}catch{}
 return demoPrivateNotifications(lang,userId);
}

export async function markPrivateRead(id:string,userId:string){
 try{await supabase.from('private_notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('user_id',userId);}catch{}
}
