import type { Doctor, Specialty, Article, DoctorVideo, DoctorAudio, Course, SpecialtyLibraryItem, Clinic, LabCenter, RadiologyCenter, AdditionalFacility, PharmacyProduct } from '@/lib/supabase';

const now = new Date().toISOString();
const photo = (id: string) => 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=600&q=80';

export const demoSpecialties: Specialty[] = [
 {id:'sp-internal',slug:'internal-medicine',name:'الباطنة',icon:'Stethoscope',description:'تشخيص وعلاج أمراض الباطنة',name_en:'Internal Medicine',name_de:'Innere Medizin',name_ru:'Внутренняя медицина',description_en:'Diagnosis and treatment of internal diseases',description_de:'Diagnose und Behandlung innerer Erkrankungen',description_ru:'Диагностика и лечение внутренних заболеваний',created_at:now},
 {id:'sp-cardiology',slug:'cardiology',name:'أمراض القلب',icon:'HeartPulse',description:'تشخيص وعلاج أمراض القلب',name_en:'Cardiology',name_de:'Kardiologie',name_ru:'Кардиология',description_en:'Heart disease diagnosis and treatment',description_de:'Diagnose und Behandlung von Herzerkrankungen',description_ru:'Диагностика и лечение заболеваний сердца',created_at:now},
 {id:'sp-psych',slug:'clinical-psychology',name:'علم النفس الإكلينيكي',icon:'Brain',description:'الصحة النفسية والعلاج النفسي',name_en:'Clinical Psychology',name_de:'Klinische Psychologie',name_ru:'Клиническая психология',description_en:'Mental health and psychotherapy',description_de:'Psychische Gesundheit und Psychotherapie',description_ru:'Психическое здоровье и психотерапия',created_at:now},
 {id:'sp-pediatrics',slug:'pediatrics',name:'طب الأطفال',icon:'Baby',description:'رعاية الأطفال',name_en:'Pediatrics',name_de:'Pädiatrie',name_ru:'Педиатрия',description_en:'Children care',description_de:'Kinderheilkunde',description_ru:'Педиатрия',created_at:now},
 {id:'sp-derma',slug:'dermatology',name:'الجلدية',icon:'Sparkles',description:'أمراض وجراحة الجلد',name_en:'Dermatology',name_de:'Dermatologie',name_ru:'Дерматология',description_en:'Skin diseases and treatment',description_de:'Hauterkrankungen und Behandlung',description_ru:'Заболевания кожи и лечение',created_at:now},
 {id:'sp-dental',slug:'dentistry',name:'طب الأسنان',icon:'Smile',description:'صحة الفم والأسنان',name_en:'Dentistry',name_de:'Zahnmedizin',name_ru:'Стоматология',description_en:'Oral and dental health',description_de:'Zahn- und Mundgesundheit',description_ru:'Здоровье зубов والفم',created_at:now},
 {id:'sp-neuro',slug:'neurology',name:'الأعصاب',icon:'Brain',description:'أمراض الجهاز العصبي',name_en:'Neurology',name_de:'Neurologie',name_ru:'Неврология',description_en:'Nervous system disorders',description_de:'Erkrankungen des Nervensystems',description_ru:'Заболевания нервensystems',created_at:now},
 {id:'sp-ortho',slug:'orthopedics',name:'العظام',icon:'Bone',description:'العظام والمفاصل وإعادة التأهيل',name_en:'Orthopedics',name_de:'Orthopädie',name_ru:'Ортопедия',description_en:'Bones, joints and rehabilitation',description_de:'Knochen, Gelenke und Rehabilitation',description_ru:'Кости, суставы и реабилитация',created_at:now},
];

export const demoDoctors: Doctor[] = [
 {id:'doc-1',name:'د. أحمد حسن',specialty_id:'sp-internal',bio:'استشاري باطنة بخبرة واسعة في التشخيص والمتابعة.',education:'دكتوراه الطب الباطني',experience_years:15,photo_url:photo('photo-1612349317150-e413f6a5b16d'),city:'دمشق',rating:4.9,consultation_count:1240,native_language:'ar',is_online:true,is_verified:true,is_virtual:true,phone_number:null,follower_count:3200,nationality:'سوري',created_at:now,specialty:demoSpecialties[0]},
 {id:'doc-2',name:'د. سارة محمود',specialty_id:'sp-psych',bio:'أخصائية علم نفس إكلينيكي وعلاج معرفي سلوكي.',education:'ماجستير علم النفس الإكلينيكي',experience_years:11,photo_url:photo('photo-1559839734-2b71ea197ec2'),city:'حلب',rating:4.8,consultation_count:890,native_language:'ar',is_online:true,is_verified:true,is_virtual:true,phone_number:null,follower_count:2100,nationality:'سورية',created_at:now,specialty:demoSpecialties[2]},
 {id:'doc-3',name:'د. محمد علي',specialty_id:'sp-cardiology',bio:'استشاري أمراض قلب وقسطرة قلبية.',education:'زمالة أمراض القلب',experience_years:18,photo_url:photo('photo-1537368910025-700350fe46c7'),city:'حمص',rating:4.9,consultation_count:1560,native_language:'ar',is_online:false,is_verified:true,is_virtual:true,phone_number:null,follower_count:4100,nationality:'سوري',created_at:now,specialty:demoSpecialties[1]},
 {id:'doc-4',name:'د. ليلى كريم',specialty_id:'sp-pediatrics',bio:'طبيبة أطفال وحديثي الولادة.',education:'دكتوراه طب الأطفال',experience_years:13,photo_url:photo('photo-1594824476967-48c8b964273f'),city:'اللاذقية',rating:4.7,consultation_count:760,native_language:'ar',is_online:true,is_verified:true,is_virtual:true,phone_number:null,follower_count:1800,nationality:'سورية',created_at:now,specialty:demoSpecialties[3]},
];

export const demoArticles: Article[] = [
 {id:'art-1',specialty_id:'sp-cardiology',doctor_id:'doc-3',title:'كيف تحافظ على صحة قلبك؟',excerpt:'نصائح عملية مبنية على أسس طبية للوقاية من أمراض القلب.',body:'دليل مبسط حول الحركة والغذاء والمتابعة الطبية وعوامل الخطورة.',image_url:photo('photo-1505751172876-fa1923c5c528'),reading_time_min:6,views:12400,created_at:now,specialty:demoSpecialties[1],doctor:demoDoctors[2]},
 {id:'art-2',specialty_id:'sp-psych',doctor_id:'doc-2',title:'إدارة التوتر والقلق بطريقة صحية',excerpt:'خطوات يومية تساعد على تنظيم التوتر وتحسين جودة الحياة.',body:'معلومات تثقيفية عن النوم والتنفس والنشاط والمتابعة مع المختص عند الحاجة.',image_url:photo('photo-1499209974431-9dddcece7f88'),reading_time_min:5,views:9800,created_at:now,specialty:demoSpecialties[2],doctor:demoDoctors[1]},
 {id:'art-3',specialty_id:'sp-pediatrics',doctor_id:'doc-4',title:'دليل مختصر لصحة الطفل',excerpt:'أهم نقاط المتابعة والتغذية والنوم خلال مراحل النمو.',body:'إرشادات عامة للآباء مع التنبيه إلى أهمية مراجعة طبيب الأطفال.',image_url:photo('photo-1544126592-807daa215a91'),reading_time_min:7,views:7300,created_at:now,specialty:demoSpecialties[3],doctor:demoDoctors[3]},
 {id:'art-4',specialty_id:'sp-derma',doctor_id:'doc-1',title:'العناية اليومية بالبشرة',excerpt:'أساسيات بسيطة للعناية بالبشرة وحمايتها من العوامل البيئية.',body:'روتين يومي عام للعناية بالبشرة.',image_url:photo('photo-1556228578-8c89e6adf883'),reading_time_min:4,views:6500,created_at:now,specialty:demoSpecialties[4],doctor:demoDoctors[0]},
];

export const demoVideos: DoctorVideo[] = demoArticles.slice(0,3).map((a,i)=>({id:'vid-'+(i+1),doctor_id:a.doctor_id!,specialty_id:a.specialty_id,title:a.title,description:a.excerpt,video_url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',thumbnail_url:a.image_url,duration_seconds:240+i*60,views:3200+i*900,created_at:now,doctor:a.doctor,specialty:a.specialty}));
export const demoAudio: DoctorAudio[] = demoArticles.slice(0,3).map((a,i)=>({id:'aud-'+(i+1),doctor_id:a.doctor_id!,specialty_id:a.specialty_id,title:'بودكاست SB1: '+a.title,description:a.excerpt,audio_url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',duration_seconds:360+i*90,listens:1200+i*400,created_at:now,doctor:a.doctor,specialty:a.specialty}));
export const demoCourses: Course[] = demoArticles.slice(0,3).map((a,i)=>({id:'course-'+(i+1),specialty_id:a.specialty_id,doctor_id:a.doctor_id,title:['أساسيات التثقيف الصحي','العلاج المعرفي السلوكي للمبتدئين','أساسيات صحة القلب'][i],description:a.excerpt,image_url:a.image_url,price:[29,39,49][i],duration_weeks:4+i,lessons_count:8+i*2,level:i===0?'beginner':'intermediate',enrolled_count:120+i*80,rating:4.7+i*.1,is_published:true,created_at:now,doctor:a.doctor,specialty:a.specialty}));

export const demoClinics: Clinic[] = [
 {id:'clinic-1',doctor_id:'doc-1',name:'مركز SB1 الطبي',description:'عيادة متعددة التخصصات مع حجز إلكتروني.',address:'دمشق - شارع الصحة',phone:'+963 11 000 0000',image_url:photo('photo-1519494026892-80bbd2d6fd0d'),is_active:true,created_at:now,doctor:{name:'د. أحمد حسن'}},
 {id:'clinic-2',doctor_id:'doc-3',name:'مركز القلب التخصصي',description:'خدمات قلبية وتشخيصية متقدمة.',address:'حمص - المركز الطبي',phone:'+963 31 000 0000',image_url:photo('photo-1580281658223-9b93f18ae9ae'),is_active:true,created_at:now,doctor:{name:'د. محمد علي'}},
] as Clinic[];
export const demoLabs: LabCenter[] = [
 {id:'lab-1',name:'مختبر SB1 المركزي',description:'تحاليل مخبرية شاملة وحجز مسبق.',services:'تحاليل الدم، الهرمونات، الكيمياء الحيوية',address:'دمشق - المركز الصحي',phone:'+963 11 111 1111',image_url:photo('photo-1579154204601-01588f351e67'),is_active:true,created_at:now},
 {id:'lab-2',name:'مختبر الحياة',description:'خدمات مخبرية مع نتائج رقمية.',services:'تحاليل شاملة وفحوص دورية',address:'حلب - شارع الجامعة',phone:'+963 21 222 2222',image_url:photo('photo-1582719478250-c89cae4dc85b'),is_active:true,created_at:now},
] as LabCenter[];
export const demoRadiology: RadiologyCenter[] = [
 {id:'rad-1',name:'مركز SB1 للتصوير الطبي',description:'تصوير وتشخيص طبي حديث.',services:'MRI، CT، Ultrasound، X-Ray',address:'دمشق - حي الصحة',phone:'+963 11 333 3333',image_url:photo('photo-1576091160399-112ba8d25d1d'),is_active:true,created_at:now},
 {id:'rad-2',name:'مركز النخبة للأشعة',description:'خدمات تصوير متقدمة ومواعيد إلكترونية.',services:'MRI، CT، أشعة رقمية',address:'حلب - المدينة الطبية',phone:'+963 21 444 4444',image_url:photo('photo-1559757175-0eb30cd8c063'),is_active:true,created_at:now},
] as RadiologyCenter[];
export const demoFacilities: AdditionalFacility[] = [
 {id:'fac-1',facility_type:'rehab',name:'مركز SB1 للتأهيل',description:'إعادة تأهيل وعلاج طبيعي.',address:'دمشق - شارع العلاج',phone:'+963 11 555 5555',image_url:photo('photo-1576091160550-2173dba999ef'),is_active:true,created_at:now},
 {id:'fac-2',facility_type:'pharmacy',name:'صيدلية SB1',description:'صيدلية وخدمة توصيل.',address:'دمشق - المركز',phone:'+963 11 666 6666',image_url:photo('photo-1585435557343-3b092031a831'),is_active:true,created_at:now},
 {id:'fac-3',facility_type:'nursing',name:'دار SB1 للرعاية',description:'رعاية كبار السن وخدمات تمريضية.',address:'حلب - حي الهدوء',phone:'+963 21 777 7777',image_url:photo('photo-1516307365426-bea591f05011'),is_active:true,created_at:now},
] as AdditionalFacility[];
export const demoProducts: PharmacyProduct[] = [
 {id:'prod-1',facility_id:'fac-2',name:'مجموعة فيتامينات يومية',description:'منتج تجريبي للعرض في المتجر.',price:12,currency:'USD',image_url:photo('photo-1607619056574-7b8d3ee536b2'),stock_quantity:40,is_active:true,created_at:now},
 {id:'prod-2',facility_id:'fac-2',name:'جهاز قياس ضغط الدم',description:'جهاز منزلي للمتابعة.',price:35,currency:'USD',image_url:photo('photo-1559757148-5c350d0d3c56'),stock_quantity:25,is_active:true,created_at:now},
];
export const demoLibrary: SpecialtyLibraryItem[] = [
 {id:'lib-1',specialty_id:'sp-internal',item_type:'article',title:'دليل الباطنة للمريض',description:'مادة تثقيفية مبسطة.',url:null,image_url:null,source:'SB1 Medical Library',is_auto_generated:false,created_at:now,specialty:demoSpecialties[0]},
 {id:'lib-2',specialty_id:'sp-cardiology',item_type:'book',title:'أساسيات صحة القلب',description:'مرجع تثقيفي مختصر.',url:null,image_url:null,source:'SB1 Medical Library',is_auto_generated:false,created_at:now,specialty:demoSpecialties[1]},
 {id:'lib-3',specialty_id:'sp-psych',item_type:'news',title:'الصحة النفسية وجودة الحياة',description:'محتوى توعوي حديث.',url:null,image_url:null,source:'SB1 Editorial',is_auto_generated:false,created_at:now,specialty:demoSpecialties[2]},
 {id:'lib-4',specialty_id:'sp-pediatrics',item_type:'service',title:'خدمات طب الأطفال',description:'دليل الخدمات والمواعيد.',url:null,image_url:null,source:'SB1',is_auto_generated:false,created_at:now,specialty:demoSpecialties[3]},
];
