export type AdTarget={type:'doctor'|'service'|'institution'|'course'|'video'|'book'|'game'|'collection'|'url';ids:string[];path?:string};
export type MarketplaceAd={id:string;ownerName:string;audience:'specialist'|'institution'|'delivery'|'all';title:string;copy:string;mediaType:'image'|'video';mediaUrl:string;placement:string;status:'pending'|'approved'|'rejected';startAt:string;endAt:string;target:AdTarget;createdAt:string;autoReview:boolean};
export type AdPackage={id:string;name:string;audience:string;placement:string;days:number;price:number;description:string};
const KEY='sb1_marketplace_ads_v1';
export const AD_PACKAGES:AdPackage[]=[
{id:'sp-home',name:'باقة الأخصائي — الرئيسية',audience:'specialist',placement:'الرئيسية',days:7,price:99,description:'مساحات أفقية في الصفحة الرئيسية مع ربط بطبيب أو خدمة أو محتوى.'},
{id:'sp-content',name:'باقة الأخصائي — المحتوى',audience:'specialist',placement:'صفحات المحتوى',days:7,price:59,description:'ظهور داخل صفحات المقالات والفيديو والدورات والمكتبة.'},
{id:'inst-home',name:'باقة المؤسسة — الرئيسية',audience:'institution',placement:'الرئيسية',days:14,price:199,description:'إعلان مؤسسة مع رابط مباشر إلى صفحة المؤسسة أو خدماتها.'},
{id:'inst-facilities',name:'باقة المؤسسة — المرافق',audience:'institution',placement:'المرافق الطبية',days:14,price:149,description:'ظهور في صفحات العيادات والمختبرات والأشعة والمرافق.'},
{id:'delivery',name:'باقة عامل التوصيل',audience:'delivery',placement:'الألعاب والتطبيقات',days:30,price:79,description:'إعلان رأسي صغير مناسب لخدمات التوصيل.'},
{id:'all-premium',name:'باقة متعددة المنتجات',audience:'all',placement:'مخصص',days:30,price:299,description:'ربط الإعلان بأكثر من منتج أو خدمة أو محتوى.'},
];
export function readAds():MarketplaceAd[]{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
export function writeAds(v:MarketplaceAd[]){localStorage.setItem(KEY,JSON.stringify(v));window.dispatchEvent(new Event('sb1-marketplace-ads-change'))}
export function addAd(ad:MarketplaceAd){writeAds([ad,...readAds()])}
export function updateAd(id:string,patch:Partial<MarketplaceAd>){writeAds(readAds().map(a=>a.id===id?{...a,...patch}:a))}
export function approvedAds(placement:string){const now=Date.now();return readAds().filter(a=>a.status==='approved'&&a.placement===placement&&new Date(a.startAt).getTime()<=now&&new Date(a.endAt).getTime()>=now)}
export function seedDemoAds(){if(readAds().length)return;const now=new Date();const end=new Date(now.getTime()+30*86400000);addAd({id:'demo-ad-jamal',ownerName:'دكتور جمال نادي',audience:'specialist',title:'استشارة أونلاين',copy:'احجز استشارتك الآن مع دكتور جمال نادي',mediaType:'image',mediaUrl:'/jamal-james.jpg',placement:'home-news',status:'approved',startAt:now.toISOString(),endAt:end.toISOString(),target:{type:'doctor',ids:['james'] ,path:'/doctors/james'},createdAt:now.toISOString(),autoReview:true});}
