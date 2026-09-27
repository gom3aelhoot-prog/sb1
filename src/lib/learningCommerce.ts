import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';

export const LEARNING_LANGUAGES = ['ar','en','de','ru','uk','uz','hy','tg','az','am','ka'] as const;
export type LearningLang = typeof LEARNING_LANGUAGES[number];

const labels:any={
 ar:{book:'مرجع طبي وعلمي',course:'دورة تدريبية',chapter:'الفصل',lesson:'الدرس',video:'فيديو تعليمي',surgical:'فيديو جراحي تعليمي',ai:'محتوى مولد بالذكاء الاصطناعي — يحتاج مراجعة تحريرية وطبية'},
 en:{book:'Medical & Scientific Reference',course:'Training Course',chapter:'Chapter',lesson:'Lesson',video:'Training Video',surgical:'Surgical Training Video',ai:'AI-generated educational draft — requires medical/editorial review'},
 de:{book:'Medizinische & wissenschaftliche Referenz',course:'Fortbildung',chapter:'Kapitel',lesson:'Lektion',video:'Lehrvideo',surgical:'Chirurgisches Lehrvideo',ai:'KI-generierter Entwurf — medizinische/redaktionelle Prüfung erforderlich'},
 ru:{book:'Медицинский и научный справочник',course:'Учебный курс',chapter:'Глава',lesson:'Урок',video:'Учебное видео',surgical:'Хирургическое учебное видео',ai:'Черновик, созданный ИИ — требуется медицинская и редакционная проверка'},
 uk:{book:'Медичний і науковий довідник',course:'Навчальний курс',chapter:'Розділ',lesson:'Урок',video:'Навчальне відео',surgical:'Хірургічне навчальне відео',ai:'Чернетка ШІ — потребує медичної та редакційної перевірки'},
 uz:{book:'Tibbiy va ilmiy qo‘llanma',course:'O‘quv kursi',chapter:'Bob',lesson:'Dars',video:'O‘quv videosi',surgical:'Jarrohlik o‘quv videosi',ai:'AI yaratgan qoralama — tibbiy va tahririy tekshiruv talab qilinadi'},
 hy:{book:'Բժշկական և գիտական ուղեցույց',course:'Ուսուցման դասընթաց',chapter:'Գլուխ',lesson:'Դաս',video:'Ուսուցողական տեսանյութ',surgical:'Վիրաբուժական ուսուցողական տեսանյութ',ai:'AI-ի ստեղծած նախագիծ — պահանջում է բժշկական/խմբագրական ստուգում'},
 tg:{book:'Роҳнамои тиббӣ ва илмӣ',course:'Курси омӯзишӣ',chapter:'Боб',lesson:'Дарс',video:'Видеои омӯзишӣ',surgical:'Видеои омӯзиши ҷарроҳӣ',ai:'Лоиҳаи AI — санҷиши тиббӣ ва таҳрирӣ зарур аст'},
 az:{book:'Tibbi və elmi məlumat kitabı',course:'Təlim kursu',chapter:'Fəsil',lesson:'Dərs',video:'Təlim videosu',surgical:'Cərrahi təlim videosu',ai:'Süni intellekt layihəsi — tibbi və redaktə yoxlaması tələb olunur'},
 am:{book:'የሕክምና እና ሳይንሳዊ መመሪያ',course:'የስልጠና ኮርስ',chapter:'ምዕራፍ',lesson:'ትምህርት',video:'የስልጠና ቪዲዮ',surgical:'የቀዶ ጥገና ስልጠና ቪዲዮ',ai:'በAI የተፈጠረ ረቂቅ — የሕክምና/አርትዖት ግምገማ ያስፈልጋል'},
 ka:{book:'სამედიცინო და სამეცნიერო სახელმძღვანელო',course:'სასწავლო კურსი',chapter:'თავი',lesson:'გაკვეთილი',video:'სასწავლო ვიდეო',surgical:'ქირურგიული სასწავლო ვიდეო',ai:'AI-ის მიერ შექმნილი მონახაზი — საჭიროა სამედიცინო/რედაქციული შემოწმება'}
};
const L=(lang:string)=>labels[lang]||labels.en;
const spec=(slug:string)=>comprehensiveSpecialties.find(s=>s.slug===slug);
const specName=(s:any,lang:string)=>lang==='ar'?s.ar:(s[lang]||s.en||s.ar);

export type LearningBook={id:string;slug:string;language:string;title:string;description:string;price:number;currency:string;pages:number;chapters:string[];ai_generated:true;downloadable:true;is_paid:true};
export function learningBooks(lang:string,count=200):LearningBook[]{return Array.from({length:count},(_,i)=>{const s=comprehensiveSpecialties[i%comprehensiveSpecialties.length];const n=specName(s,lang);const no=i+1;return{id:`learning-book-${lang}-${no}`,slug:s.slug,language:lang,title:`${L(lang).book}: ${n} — ${no}`,description:`${L(lang).ai}. ${n}. ${lang==='ar'?'يشمل التعريف وعوامل الخطورة والأعراض والفحوصات والتعامل العام والمتابعة.':'Includes definition, risk factors, common findings, assessment, general management and follow-up.'}`,price:7+(i%15)*3,currency:'USD',pages:80+(i%9)*20,chapters:Array.from({length:8},(_,c)=>`${L(lang).chapter} ${c+1}: ${n}`),ai_generated:true,downloadable:true,is_paid:true};});}

export type LearningCourse={id:string;slug:string;language:string;title:string;description:string;price:number;chapters:{title:string;lessons:{title:string;video_url:string|null;duration:number}[]}[];audience:string[];downloadable:true;online:true;ai_generated:true};
export function learningCourses(lang:string,count=160):LearningCourse[]{return Array.from({length:count},(_,i)=>{const s=comprehensiveSpecialties[i%comprehensiveSpecialties.length];const n=specName(s,lang);return{id:`learning-course-${lang}-${i+1}`,slug:s.slug,language:lang,title:`${L(lang).course}: ${n} — المستوى ${(i%4)+1}`,description:`${L(lang).ai}. برنامج تدريبي متعدد الفصول للأخصائيين والعملاء ومندوبي التوصيل حسب المجال.`,price:19+(i%20)*5,chapters:Array.from({length:6},(_,c)=>({title:`${L(lang).chapter} ${c+1}`,lessons:Array.from({length:5},(_,j)=>({title:`${L(lang).lesson} ${c*5+j+1} — ${n}`,video_url:null,duration:10+(j*5)}))})),audience:['specialist','client','delivery'],downloadable:true,online:true,ai_generated:true};});}

export function protectedSurgicalVideos(lang:string,count=220){return Array.from({length:count},(_,i)=>{const s=comprehensiveSpecialties[i%comprehensiveSpecialties.length];const n=specName(s,lang);return{id:`surgical-video-${lang}-${i+1}`,language:lang,title:`${L(lang).surgical}: ${n} — ${i+1}`,description:`${L(lang).ai}. مادة جراحية تعليمية محمية؛ لا يتم نشر ملف الفيديو أو رابط عام قبل رفعه واعتماده من المالك.`,specialty:s.slug,price:29+(i%12)*5,is_paid:true,protected:true,watermark:'SB1',identity_overlay:true,video_url:null,upload_required:true};});}

export const learningRevenueDefaults={platform_percent:30,creator_percent:70,free_course_every:5,free_book_every:5,platform_free_entitlement:'one free course or one free download per five paid purchases',owner_can_change:true};
export function learningRevenue(amount:number,platformPercent=learningRevenueDefaults.platform_percent){const platform=Math.max(0,Math.min(100,platformPercent));const site=Number((amount*platform/100).toFixed(2));return{gross:Number(amount.toFixed(2)),platform,site,creator:Number((amount-site).toFixed(2))};}
export function freeEntitlement(paidCount:number,type:'course'|'book'){const n=paidCount||0;return n>0&&n%5===0?{eligible:true,type}:{eligible:false,type};}
