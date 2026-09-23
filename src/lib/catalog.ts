import type { Doctor, Specialty, Question, Answer, Article, DoctorVideo, DoctorAudio, SpecialtyLibraryItem, AdditionalFacility } from '@/lib/supabase';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';

export const LANGUAGE_PROFILES: Record<string,{country:string;city:string;native:string;names:string[]}> = {
  ar:{country:'الدول العربية',city:'دمشق',native:'العربية',names:['د. جمال نادي','د. أحمد خالد','د. سامر محمود','د. ياسر حسن','د. كريم علي','د. عمر يوسف','د. رامي أسعد','د. مازن خليل']},
  en:{country:'United Kingdom',city:'London',native:'English',names:['Dr. James','Dr. Daniel Smith','Dr. Michael Brown','Dr. David Wilson','Dr. Robert Taylor','Dr. John Miller','Dr. William Davis','Dr. Thomas Moore']},
  de:{country:'Deutschland',city:'Berlin',native:'Deutsch',names:['Dr. James','Dr. Lukas Müller','Dr. Anna Schneider','Dr. Thomas Weber','Dr. Julia Fischer','Dr. Felix Wagner','Dr. Marie Becker','Dr. Paul Hoffmann']},
  ru:{country:'Россия',city:'Москва',native:'Русский',names:['ДОКТОР ДЖЕЙМС','Доктор Иван Петров','Доктор Анна Смирнова','Доктор Сергей Волков','Доктор Елена Кузнецова','Доктор Дмитрий Орлов','Доктор Мария Соколова','Доктор Алексей Морозов']},
  uk:{country:'Україна',city:'Київ',native:'Українська',names:['Доктор Джеймс','Доктор Олександр Коваль','Доктор Анна Шевченко','Доктор Дмитро Бондар','Доктор Марія Ткач','Доктор Ірина Мельник','Доктор Андрій Левченко','Доктор Наталія Романюк']},
  uz:{country:'O‘zbekiston',city:'Toshkent',native:'O‘zbekcha',names:['Doktor Jeyms','Doktor Aziz Karimov','Doktor Dilnoza Aliyeva','Doktor Bekzod Rahimov','Doktor Malika Xasanova','Doktor Sardor Yusupov','Doktor Nigora Tursunova','Doktor Kamol Ergashev']},
  hy:{country:'Հայաստան',city:'Երևան',native:'Հայերեն',names:['Դոկտոր Ջեյմս','Դոկտոր Արման Սարգսյան','Դոկտոր Աննա Մկրտչյան','Դոկտոր Հայկ Պետրոսյան','Դոկտոր Մարիամ Գրիգորյան','Դոկտոր Նարեկ Հովհաննիսյան','Դոկտոր Լիլիթ Կարապետյան','Դոկտոր Գոռ Մանուկյան']},
  tg:{country:'Тоҷикистон',city:'Душанбе',native:'Тоҷикӣ',names:['Доктор Ҷеймс','Доктор Фарид Саидов','Доктор Манижа Раҳимова','Доктор Камол Нуров','Доктор Меҳринисо Каримова','Доктор Ҷамшед Ҳусейнов','Доктор Шаҳноза Алиева','Доктор Беҳрӯз Давлатов']},
  az:{country:'Azərbaycan',city:'Bakı',native:'Azərbaycan dili',names:['Doktor Ceyms','Doktor Elvin Məmmədov','Doktor Aysel Əliyeva','Doktor Murad Həsənov','Doktor Nigar Hüseynova','Doktor Kamran Rzayev','Doktor Leyla Quliyeva','Doktor Tural Abbasov']},
  am:{country:'ኢትዮጵያ',city:'አዲስ አበባ',native:'አማርኛ',names:['ዶክተር ጄምስ','ዶክተር አበበ ተስፋዬ','ዶክተር ሚሚ አለሙ','ዶክተር ዳዊት በቀለ','ዶክተር ሳራ ገብረ','ዶክተር ናትናኤል ሀይሉ','ዶክተር ሜሮን አሰፋ','ዶክተር ዮሐንስ ከበደ']},
  ka:{country:'საქართველო',city:'თბილისი',native:'ქართული',names:['დოქტორი ჯეიმსი','დოქტორი გიორგი ბერიძე','დოქტორი ნინო კაპანაძე','დოქტორი დავით მაისურაძე','დოქტორი მარიამ ჯაფარიძე','დოქტორი ლაშა ქავთარაძე','დოქტორი ანა გელაშვილი','დოქტორი ირაკლი ხუციშვილი']},
};

export const languageCountry = (lang:string) => LANGUAGE_PROFILES[lang] || LANGUAGE_PROFILES.ar;

export function localizedSpecialty(s:any, lang:string) {
  if (lang==='ar') return s.ar;
  if (lang==='en') return s.en;
  if (lang==='de') return s.de;
  if (lang==='ru') return s.ru;
  return s.en || s.ar;
}

export function specialtyCatalog(lang:string): Specialty[] {
  return comprehensiveSpecialties.map((s,i)=>({
    id:'catalog-sp-'+s.slug, slug:s.slug, name:localizedSpecialty(s,lang), icon:'Stethoscope', description:s.ar,
    name_en:s.en,name_de:s.de,name_ru:s.ru,description_en:s.en,description_de:s.de,description_ru:s.ru,created_at:new Date(2026,0,1+i).toISOString()
  }));
}

export function virtualDoctorsForSpecialty(slug:string, lang:string, count=8): Doctor[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const p=languageCountry(lang); const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!;
  return Array.from({length:Math.max(5,Math.min(25,count))},(_,i)=>({
    id:`catalog-doctor-${lang}-${slug}-${i+1}`, name:p.names[i%p.names.length], specialty_id:sp.id,
    bio: lang==='ar' ? `أخصائي افتراضي تعليمي في ${s.ar}. هذا الملف تجريبي وغير مرتبط بشخص حقيقي.` : `Virtual educational specialist profile for ${s.en}. This demo profile is not a real person.`,
    education:'SB1 Virtual Specialist Program', experience_years:5+(i%18), photo_url:'',
    city:p.city, rating:4.5+(i%5)/10, consultation_count:120+i*31, native_language:lang,
    is_online:i%3!==0, is_verified:false, is_virtual:true, phone_number:null, follower_count:600+i*47,
    nationality:p.country, created_at:new Date().toISOString(), specialty:sp
  })) as Doctor[];
}

const qTemplates: Record<string,string[]> = {
  ar:['ما أهم الأعراض التي تستدعي مراجعة الأخصائي؟','ما الفحوصات الأولية المناسبة لهذه الحالة؟','كيف يمكن تحسين الأعراض بشكل آمن؟','متى تصبح المتابعة الطبية ضرورية؟','ما العوامل التي تزيد احتمال المشكلة؟','هل توجد عادات يومية تساعد على الوقاية؟','ما الفرق بين الحالات البسيطة والحالات التي تحتاج تقييماً؟','ما الأسئلة التي يجب طرحها على الأخصائي؟','هل يمكن أن تتشابه هذه الأعراض مع مشكلة أخرى؟','كيف أتابع حالتي بين الزيارات؟'],
  en:['What symptoms should prompt a specialist visit?','Which initial tests are commonly considered?','What safe steps may help improve symptoms?','When is medical follow-up important?','Which factors can increase the risk?','Which daily habits may support prevention?','How can mild and concerning cases differ?','What should I ask the specialist?','Can these symptoms overlap with another condition?','How should I monitor my condition between visits?'],
  de:['Welche Symptome erfordern eine fachärztliche Abklärung?','Welche ersten Untersuchungen sind üblich?','Welche sicheren Schritte können Beschwerden lindern?','Wann ist eine ärztliche Kontrolle wichtig?','Welche Faktoren erhöhen das Risiko?','Welche Gewohnheiten können vorbeugen?','Wie unterscheiden sich leichte und bedenkliche Verläufe?','Was sollte ich den Facharzt fragen?','Können die Symptome auch andere Ursachen haben?','Wie kann ich meinen Verlauf beobachten?'],
  ru:['Какие симптомы требуют обращения к специалисту?','Какие первичные обследования обычно нужны?','Что может безопасно помочь уменьшить симптомы?','Когда необходимо медицинское наблюдение?','Какие факторы повышают риск?','Какие привычки помогают профилактике?','Чем отличаются лёгкие и тревожные случаи?','Что спросить у специалиста?','Могут ли эти симптомы иметь другую причину?','Как наблюдать состояние между визитами?']
};

export function virtualQuestionsForSpecialty(slug:string,lang:string,count=50): Question[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const names=LANGUAGE_PROFILES[lang]?.names||LANGUAGE_PROFILES.ar.names;
  const templates=qTemplates[lang]||qTemplates.en;
  return Array.from({length:count},(_,i)=>({
    id:`catalog-q-${lang}-${slug}-${i+1}`, specialty_id:sp.id, author_name:lang==='ar'?'مستخدم SB1': 'SB1 User',
    title:`${templates[i%templates.length]} — ${localizedSpecialty(s,lang)} #${i+1}`,
    body:lang==='ar'? `سؤال تجريبي تعليمي عن ${s.ar}. نرجو قراءة الإجابات العامة وعدم اعتبارها تشخيصاً فردياً.` : `Educational demo question about ${s.en}. The answers are general information, not an individual diagnosis.`,
    age:18+(i%55),gender:i%2?'أنثى':'ذكر',status:'answered',views:80+i*7,created_at:new Date(2026,0,1+(i%28)).toISOString(),specialty:sp
  }));
}

export function virtualAnswersForQuestion(question:Question,lang:string,count=8): Answer[] {
  const names=LANGUAGE_PROFILES[lang]?.names||LANGUAGE_PROFILES.en.names;
  return Array.from({length:Math.max(5,Math.min(20,count))},(_,i)=>({
    id:`${question.id}-answer-${i+1}`, question_id:question.id, doctor_id:`${question.id}-doctor-${i+1}`,
    body:lang==='ar'? `إجابة تجريبية من أخصائي افتراضي: تعتمد الخطوة المناسبة على تفاصيل الحالة والتاريخ المرضي والفحص. عند وجود أعراض شديدة أو مستمرة يجب طلب تقييم طبي مباشر.` : `Demo specialist answer: the appropriate next step depends on the history, examination and details of the case. Persistent or severe symptoms should be assessed by a qualified professional.`,
    helpful_count:20+i*3,created_at:new Date().toISOString(),doctor:virtualDoctorsForSpecialty(question.specialty?.slug||'',lang,8)[i%8]
  }));
}

export function virtualArticlesForSpecialty(slug:string,lang:string,count=3): Article[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const doc=virtualDoctorsForSpecialty(slug,lang,5)[0];
  return Array.from({length:count},(_,i)=>({
    id:`catalog-art-${lang}-${slug}-${i+1}`,specialty_id:sp.id,doctor_id:doc.id,
    title:lang==='ar'?`دليل تثقيفي: ${s.ar} — الجزء ${i+1}`:`Educational guide: ${s.en} — Part ${i+1}`,
    excerpt:lang==='ar'?`مقال تثقيفي مُنشأ بالذكاء الاصطناعي للمراجعة التحريرية حول ${s.ar}.`:`AI-generated educational draft for editorial review about ${s.en}.`,
    body:lang==='ar'? `هذا محتوى تثقيفي تجريبي مُنشأ بالذكاء الاصطناعي لأغراض العرض، يشرح المفاهيم العامة وعوامل الخطورة والمتابعة ومتى يجب مراجعة الأخصائي. لا يُستخدم للتشخيص أو العلاج الفردي.\\n\\n${s.ar} موضوع واسع ويجب تخصيص النصيحة حسب الحالة.`:`This is an AI-generated educational draft for demonstration and editorial review about ${s.en}. It covers general concepts, risk factors, monitoring and when to seek professional care. It is not individual diagnosis or treatment.\\n\\nContent should be reviewed before publication.`,
    image_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',reading_time_min:5+i,views:1000+i*300,created_at:new Date().toISOString(),specialty:sp,doctor:doc
  })) as Article[];
}

export function virtualVideosForSpecialty(slug:string,lang:string,count=2): DoctorVideo[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const doc=virtualDoctorsForSpecialty(slug,lang,5)[0];
  return Array.from({length:count},(_,i)=>({
    id:`catalog-vid-${lang}-${slug}-${i+1}`,doctor_id:doc.id,specialty_id:sp.id,
    title:lang==='ar'?`شرح مبسط في ${s.ar} — ${i+1}`:`Simple lesson in ${s.en} — ${i+1}`,
    description:lang==='ar'?'فيديو تجريبي مبسط باللغة المختارة.':'Simple demo video in the selected language.',
    video_url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnail_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',duration_seconds:180,views:500+i*100,created_at:new Date().toISOString(),doctor:doc,specialty:sp
  }));
}

export function virtualAudioForSpecialty(slug:string,lang:string,count=2): DoctorAudio[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const doc=virtualDoctorsForSpecialty(slug,lang,5)[0];
  return Array.from({length:count},(_,i)=>({
    id:`catalog-audio-${lang}-${slug}-${i+1}`,doctor_id:doc.id,specialty_id:sp.id,
    title:lang==='ar'?`تسجيل صوتي: ${s.ar} — ${i+1}`:`Audio guide: ${s.en} — ${i+1}`,
    description:lang==='ar'?'تسجيل صوتي تجريبي للتثقيف الصحي.':'Demo educational audio in the selected language.',
    audio_url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',duration_seconds:300,listens:200,created_at:new Date().toISOString(),doctor:doc,specialty:sp
  }));
}

export function virtualLibraryForSpecialty(slug:string,lang:string,count=2): SpecialtyLibraryItem[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!;
  return Array.from({length:count},(_,i)=>({
    id:`catalog-book-${lang}-${slug}-${i+1}`,specialty_id:sp.id,item_type:'book',title:lang==='ar'?`كتاب ${s.ar} — المجلد ${i+1}`:`${s.en} Handbook — Volume ${i+1}`,
    description:lang==='ar'?'كتاب تجريبي تعليمي من مكتبة SB1.':'Demo educational book in the SB1 library.',url:null,image_url:null,source:'SB1 AI Editorial Library',is_auto_generated:true,created_at:new Date().toISOString(),specialty:sp
  })) as SpecialtyLibraryItem[];
}

export function virtualFacilities(lang:string, country?:string): AdditionalFacility[] {
  const p=languageCountry(lang); const wanted=country||p.country;
  const kinds=[['clinic','عيادة / Clinic'],['lab','مختبر / Lab'],['radiology','مركز أشعة / Radiology'],['elderly','دار رعاية مسنين / Elderly Care'],['pharmacy','صيدلية / Pharmacy'],['addiction','مركز علاج الإدمان / Addiction Care'],['rehab','مركز تأهيل وعلاج طبيعي / Rehabilitation'],['medical-supplies','متجر أدوات طبية / Medical Supplies']];
  return kinds.map(([kind,label],i)=>({
    id:`catalog-fac-${lang}-${kind}`,facility_type:kind,name:lang==='ar'?`${label.split(' / ')[0]} ${wanted}`:`${label.split(' / ')[1]} ${wanted}`,
    description:lang==='ar'?`بيانات تجريبية للمرفق باللغة العربية في ${wanted}.`:`Demo facility data in ${p.native} for ${wanted}.`,
    address:p.city+' - SB1 Health District',phone:null,email:null,logo_url:null,services:'Appointments, services, prices and schedules',schedule:{sun:'09:00-18:00',mon:'09:00-18:00',tue:'09:00-18:00',wed:'09:00-18:00',thu:'09:00-18:00'},rating:4.6,is_active:true,created_at:new Date().toISOString(),city:p.city,country:wanted,language:lang
  })) as any;
}


export function virtualCoursesForSpecialty(slug:string,lang:string,count=4) {
 const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
 const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const doc=virtualDoctorsForSpecialty(slug,lang,5)[0];
 return Array.from({length:count},(_,i)=>({id:`catalog-course-${lang}-${slug}-${i+1}`,specialty_id:sp.id,doctor_id:doc.id,title:lang==='ar'?`دورة ${s.ar} العملية — المستوى ${i+1}`:`${s.en} Practical Course — Level ${i+1}`,description:lang==='ar'?`دورة تدريبية تجريبية مُنشأة بالذكاء الاصطناعي مع مراجعة تعليمية، تتضمن دروساً واختبارات وتطبيقات عملية.`:`AI-generated educational course draft for ${s.en}, with lessons, quizzes and practical exercises for editorial review.`,image_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',price:19+i*10,duration_weeks:4+i,lessons_count:8+i*2,level:i===0?'beginner':i===1?'intermediate':'advanced',enrolled_count:100+i*50,rating:4.7,is_published:true,created_at:new Date().toISOString(),doctor,specialty:sp}));
}
