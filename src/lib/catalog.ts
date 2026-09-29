import type { Doctor, Specialty, Question, Answer, Article, DoctorVideo, DoctorAudio, SpecialtyLibraryItem, AdditionalFacility } from '@/lib/supabase';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';
import { CITIES_BY_COUNTRY, citiesForCountry } from '@/lib/cities';

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

const COUNTRY_NAMES:any={ar:{SA:'السعودية',AE:'الإمارات',EG:'مصر',IQ:'العراق',JO:'الأردن',KW:'الكويت',LB:'لبنان',LY:'ليبيا',MA:'المغرب',OM:'عُمان',PS:'فلسطين',QA:'قطر',SY:'سوريا',TN:'تونس',YE:'اليمن',DZ:'الجزائر',BH:'البحرين',MR:'موريتانيا',SD:'السودان',SO:'الصومال',DE:'ألمانيا',RU:'روسيا',UZ:'أوزبكستان',AM:'أرمينيا',TG:'طاجيكستان',UA:'أوكرانيا',AZ:'أذربيجان',KA:'جورجيا',ET:'إثيوبيا',GB:'المملكة المتحدة',US:'الولايات المتحدة'},en:{SA:'Saudi Arabia',AE:'United Arab Emirates',EG:'Egypt',IQ:'Iraq',JO:'Jordan',KW:'Kuwait',LB:'Lebanon',LY:'Libya',MA:'Morocco',OM:'Oman',PS:'Palestine',QA:'Qatar',SY:'Syria',TN:'Tunisia',YE:'Yemen',DZ:'Algeria',BH:'Bahrain',MR:'Mauritania',SD:'Sudan',SO:'Somalia',DE:'Germany',RU:'Russia',UZ:'Uzbekistan',AM:'Armenia',TG:'Tajikistan',UA:'Ukraine',AZ:'Azerbaijan',KA:'Georgia',ET:'Ethiopia',GB:'United Kingdom',US:'United States'},de:{DE:'Deutschland',RU:'Russland',UZ:'Usbekistan',AM:'Armenien',TG:'Tadschikistan',UA:'Ukraine',AZ:'Aserbaidschan',KA:'Georgien',GB:'Vereinigtes Königreich',US:'USA',SA:'Saudi-Arabien',EG:'Ägypten',AE:'Vereinigte Arabische Emirate'},ru:{RU:'Россия',UZ:'Узбекистан',AM:'Армения',TG:'Таджикистан',UA:'Украина',AZ:'Азербайджан',KA:'Грузия',DE:'Германия',GB:'Великобритания',US:'США',SA:'Саудовская Аравия',EG:'Египет',AE:'ОАЭ'},uk:{UA:'Україна',RU:'Росія',UZ:'Узбекистан',AM:'Вірменія',TG:'Таджикистан',AZ:'Азербайджан',KA:'Грузія',DE:'Німеччина',GB:'Велика Британія',US:'США'},uz:{UZ:'O‘zbekiston',RU:'Rossiya',AM:'Armaniston',TG:'Tojikiston',UA:'Ukraina',AZ:'Ozarbayjon',KA:'Gruziya',DE:'Germaniya',GB:'Buyuk Britaniya',US:'AQSh'},hy:{AM:'Հայաստան',RU:'Ռուսաստան',UZ:'Ուզբեկստան',TG:'Տաջիկստան',UA:'Ուկրաինա',AZ:'Ադրբեջան',KA:'Վրաստան',DE:'Գերմանիա',GB:'Մեծ Բրիտանիա',US:'ԱՄՆ'},tg:{TG:'Тоҷикистон',RU:'Русия',UZ:'Ӯзбекистон',AM:'Арманистон',UA:'Украина',AZ:'Озарбойҷон',KA:'Гурҷистон',DE:'Олмон',GB:'Британияи Кабир',US:'ИМА'},az:{AZ:'Azərbaycan',RU:'Rusiya',UZ:'Özbəkistan',AM:'Ermənistan',TG:'Tacikistan',UA:'Ukrayna',KA:'Gürcüstan',DE:'Almaniya',GB:'Böyük Britaniya',US:'ABŞ'},am:{ET:'ኢትዮጵያ',AM:'አርሜኒያ',RU:'ሩሲያ',UZ:'ኡዝቤኪስታን',TG:'ታጂኪስታን',UA:'ዩክሬን',AZ:'አዘርባጃን',KA:'ጆርጂያ',DE:'ጀርመን',GB:'ዩናይትድ ኪንግደም',US:'አሜሪካ'},ka:{KA:'საქართველო',RU:'რუსეთი',UZ:'უზბეკეთი',AM:'სომხეთი',TG:'ტაჯიკეთი',UA:'უკრაინა',AZ:'აზერბაიჯანი',DE:'გერმანია',GB:'გაერთიანებული სამეფო',US:'აშშ'}};
const DEFAULT_COUNTRY_BY_LANG:any={ar:'SA',en:'GB',de:'DE',ru:'RU',uk:'UA',uz:'UZ',hy:'AM',tg:'TG',az:'AZ',am:'ET',ka:'KA'};
export function countryLabel(lang:string,code:string){return COUNTRY_NAMES[lang]?.[code]||COUNTRY_NAMES.en?.[code]||code;}
export function resolveCountryCode(value?:string){if(!value)return 'SA';if(CITIES_BY_COUNTRY[value])return value;for(const [lang,names] of Object.entries(COUNTRY_NAMES)){const code=Object.entries(names as Record<string,string>).find(([,name])=>name===value)?.[0];if(code)return code;}return value;}


const LANGUAGE_COPY:any={
 ar:{article:['مقال تثقيفي','دليل عملي','ما الذي يجب معرفته'],body:'محتوى طبي تثقيفي مُنشأ بالذكاء الاصطناعي للمراجعة التحريرية، يشرح المفاهيم والأعراض وعوامل الخطورة والفحوصات والمتابعة ومتى يجب طلب المساعدة. لا يُعد تشخيصاً أو وصفة علاجية فردية.',video:'شرح طبي مبسط',audio:'تسجيل صوتي طبي',book:'كتاب طبي تعليمي',course:'دورة تدريبية عملية',question:'سؤال تثقيفي',answer:'إجابة تثقيفية من أخصائي افتراضي: تعتمد الخطوة المناسبة على التاريخ المرضي والفحص والتفاصيل. عند وجود أعراض شديدة أو مستمرة يجب طلب تقييم طبي مباشر.'},
 en:{article:['Medical Education','Practical Guide','What You Should Know'],body:'An AI-generated medical education draft for editorial review covering concepts, symptoms, risk factors, common evaluations, follow-up and when to seek professional care. It is not an individual diagnosis or prescription.',video:'Simple Medical Lesson',audio:'Medical Audio Guide',book:'Medical Education Book',course:'Practical Training Course',question:'Educational Question',answer:'Educational answer from a virtual specialist: the appropriate next step depends on history, examination and case details. Persistent or severe symptoms require professional assessment.'},
 de:{article:['Medizinischer Leitfaden','Praxisleitfaden','Wichtige Informationen'],body:'Ein von KI erstellter medizinischer Bildungsentwurf zur redaktionellen Prüfung. Er behandelt Grundlagen, Symptome, Risikofaktoren, übliche Untersuchungen, Verlaufskontrolle und den Zeitpunkt einer fachärztlichen Abklärung. Keine individuelle Diagnose oder Therapie.',video:'Einfache medizinische Erklärung',audio:'Medizinischer Audioguide',book:'Medizinisches Lehrbuch',course:'Praktischer Fortbildungskurs',question:'Bildungsfrage',answer:'Bildungsantwort eines virtuellen Spezialisten: Der nächste Schritt hängt von Anamnese, Untersuchung und Falldetails ab. Anhaltende oder schwere Beschwerden sollten professionell abgeklärt werden.'},
 ru:{article:['Медицинская статья','Практическое руководство','Что важно знать'],body:'Материал, созданный ИИ для редакторской проверки. Он рассматривает общие сведения, симптомы, факторы риска, обследования, наблюдение и ситуации, когда нужна очная медицинская помощь. Это не индивидуальный диагноз и не назначение лечения.',video:'Простое медицинское объяснение',audio:'Медицинская аудиозапись',book:'Медицинская учебная книга',course:'Практический учебный курс',question:'Образовательный вопрос',answer:'Образовательный ответ виртуального специалиста: следующий шаг зависит от анамнеза, осмотра и деталей случая. При выраженных или длительных симптомах нужна профессиональная оценка.'},
 uk:{article:['Медична стаття','Практичний посібник','Що важливо знати'],body:'Матеріал, створений ШІ для редакторської перевірки. Він охоплює загальні відомості, симптоми, фактори ризику, обстеження, спостереження та випадки, коли потрібна очна медична допомога. Це не індивідуальний діагноз чи призначення.',video:'Просте медичне пояснення',audio:'Медичний аудіозапис',book:'Медична навчальна книга',course:'Практичний навчальний курс',question:'Освітнє питання',answer:'Освітня відповідь віртуального спеціаліста: наступний крок залежить від анамнезу, огляду та деталей випадку. При виражених або тривалих симптомах потрібна професійна оцінка.'},
 uz:{article:['Tibbiy maqola','Amaliy qo‘llanma','Bilish kerak bo‘lganlar'],body:'Tahririy ko‘rib chiqish uchun sun’iy intellekt tomonidan yaratilgan tibbiy ma’rifiy material. Unda asosiy tushunchalar, alomatlar, xavf omillari, tekshiruvlar, kuzatuv va qachon mutaxassisga murojaat qilish kerakligi yoritiladi. Bu shaxsiy tashxis yoki davolash tavsiyasi emas.',video:'Oddiy tibbiy tushuntirish',audio:'Tibbiy audio yozuv',book:'Tibbiy o‘quv kitobi',course:'Amaliy o‘quv kursi',question:'Ma’rifiy savol',answer:'Virtual mutaxassisning ma’rifiy javobi: keyingi qadam anamnez, ko‘rik va holat tafsilotlariga bog‘liq. Kuchli yoki uzoq davom etuvchi alomatlarda mutaxassis bahosi kerak.'},
 hy:{article:['Բժշկական հոդված','Գործնական ուղեցույց','Ինչ պետք է իմանալ'],body:'Խմբագրական վերանայման համար արհեստական բանականությամբ ստեղծված կրթական բժշկական նյութ։ Ներկայացվում են ընդհանուր տեղեկություններ, ախտանիշներ, ռիսկի գործոններ, հետազոտություններ և մասնագետին դիմելու պահը։ Սա անհատական ախտորոշում կամ բուժման նշանակում չէ։',video:'Պարզ բժշկական բացատրություն',audio:'Բժշկական աուդիո',book:'Բժշկական ուսումնական գիրք',course:'Գործնական ուսուցման դասընթաց',question:'Կրթական հարց',answer:'Վիրտուալ մասնագետի կրթական պատասխան․ հաջորդ քայլը կախված է անամնեզից, զննումից և դեպքի մանրամասներից։ Երկարատև կամ ծանր ախտանիշների դեպքում անհրաժեշտ է մասնագիտական գնահատում։'},
 tg:{article:['Мақолаи тиббӣ','Роҳнамои амалӣ','Чиро бояд донист'],body:'Маводи тиббии омӯзишӣ, ки бо зеҳни сунъӣ барои баррасии таҳрирӣ сохта шудааст. Он маълумоти умумӣ, нишонаҳо, омилҳои хавф, ташхис ва вақти муроҷиат ба мутахассисро шарҳ медиҳад. Ин ташхис ё тавсияи табобати инфиродӣ нест.',video:'Шарҳи одии тиббӣ',audio:'Сабти аудиоии тиббӣ',book:'Китоби омӯзишии тиббӣ',course:'Курси амалии омӯзишӣ',question:'Саволи омӯзишӣ',answer:'Ҷавоби омӯзишии мутахассиси виртуалӣ: қадами навбатӣ аз таърихи беморӣ, муоина ва ҷузъиёти ҳолат вобаста аст. Ҳангоми нишонаҳои сахт ё давомдор арзёбии мутахассис зарур аст.'},
 az:{article:['Tibbi məqalə','Praktik bələdçi','Nə bilmək lazımdır'],body:'Redaksiya yoxlaması üçün süni intellekt tərəfindən yaradılmış tibbi maarifləndirici material. Ümumi məlumatları, simptomları, risk amillərini, müayinələri və nə vaxt mütəxəssisə müraciət etməli olduğunu izah edir. Bu fərdi diaqnoz və müalicə təyinatı deyil.',video:'Sadə tibbi izah',audio:'Tibbi audio yazı',book:'Tibbi tədris kitabı',course:'Praktik təlim kursu',question:'Maarifləndirici sual',answer:'Virtual mütəxəssisin maarifləndirici cavabı: növbəti addım anamnez, müayinə və vəziyyətin təfərrüatlarından asılıdır. Şiddətli və ya uzunmüddətli simptomlarda mütəxəssis qiymətləndirməsi lazımdır.'},
 am:{article:['የሕክምና ጽሑፍ','ተግባራዊ መመሪያ','ማወቅ ያለብዎት'],body:'ለአርትዖት ግምገማ በሰው ሰራሽ እውቀት የተፈጠረ የጤና ትምህርታዊ ይዘት። አጠቃላይ መረጃ፣ ምልክቶች፣ የአደጋ ምክንያቶች፣ ምርመራዎች እና መቼ ለባለሙያ መጠየቅ እንዳለብዎ ያብራራል። ይህ የግል ምርመራ ወይም ሕክምና ማዘዣ አይደለም።',video:'ቀላል የሕክምና ማብራሪያ',audio:'የሕክምና ድምጽ',book:'የሕክምና ትምህርት መጽሐፍ',course:'ተግባራዊ የስልጠና ኮርስ',question:'የትምህርት ጥያቄ',answer:'የቨርቹዋል ባለሙያ የትምህርት መልስ፦ ቀጣዩ እርምጃ በህክምና ታሪክ፣ ምርመራ እና በጉዳዩ ዝርዝሮች ይወሰናል። ከባድ ወይም የሚቆዩ ምልክቶች ካሉ የባለሙያ ግምገማ ያስፈልጋል።'},
 ka:{article:['სამედიცინო სტატია','პრაქტიკული გზამკვლევი','რა უნდა იცოდეთ'],body:'რედაქციული განხილვისთვის ხელოვნური ინტელექტით შექმნილი სამედიცინო საგანმანათლებლო მასალა. მოიცავს ზოგად ინფორმაციას, სიმპტომებს, რისკის ფაქტორებს, გამოკვლევებს და სპეციალისტთან მიმართვის დროს. ეს არ არის ინდივიდუალური დიაგნოზი ან მკურნალობის დანიშნულება.',video:'მარტივი სამედიცინო ახსნა',audio:'სამედიცინო აუდიო ჩანაწერი',book:'სამედიცინო სასწავლო წიგნი',course:'პრაქტიკული სასწავლო კურსი',question:'საგანმანათლებლო კითხვა',answer:'ვირტუალური სპეციალისტის საგანმანათლებლო პასუხი: შემდეგი ნაბიჯი დამოკიდებულია ანამნეზზე, გამოკვლევაზე და შემთხვევის დეტალებზე. მძიმე ან ხანგრძლივი სიმპტომებისას საჭიროა სპეციალისტის შეფასება.'}
};
const lc=(lang:string)=>(LANGUAGE_COPY[lang]||LANGUAGE_COPY.en);

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

export function virtualDoctorsForSpecialty(slug:string, lang:string, count=8, countryCode?:string): Doctor[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const code=resolveCountryCode(countryCode||DEFAULT_COUNTRY_BY_LANG[lang]); const cities=citiesForCountry(code); const p=languageCountry(lang); const country=countryLabel(lang,code);
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!;
  return Array.from({length:Math.max(5,Math.min(25,count))},(_,i)=>({
    id:`catalog-doctor-${lang}-${slug}-${code}-${i+1}`, name:(i<p.names.length?p.names[i]:p.names[i%p.names.length]+' — SB1 '+(i+1)), specialty_id:sp.id,
    bio: lang==='ar' ? `أخصائي افتراضي تعليمي في ${s.ar}. هذا الملف تجريبي وغير مرتبط بشخص حقيقي.` : `Virtual educational specialist profile for ${s.en}. This demo profile is not a real person.`,
    education:'SB1 Virtual Specialist Program', experience_years:5+(i%18), photo_url:'', city:cities[i%Math.max(1,cities.length)]||p.city, rating:4.5+(i%5)/10, consultation_count:120+i*31, native_language:lang,
    is_online:i%3!==0, is_verified:false, is_virtual:true, phone_number:null, follower_count:600+i*47, nationality:country, created_at:new Date().toISOString(), specialty:sp
  })) as Doctor[];
}

const qTemplates: Record<string,string[]> = {
  ar:['ما أهم الأعراض التي تستدعي مراجعة الأخصائي؟','ما الفحوصات الأولية المناسبة لهذه الحالة؟','كيف يمكن تحسين الأعراض بشكل آمن؟','متى تصبح المتابعة الطبية ضرورية؟','ما العوامل التي تزيد احتمال المشكلة؟','هل توجد عادات يومية تساعد على الوقاية؟','ما الفرق بين الحالات البسيطة والحالات التي تحتاج تقييماً؟','ما الأسئلة التي يجب طرحها على الأخصائي؟','هل يمكن أن تتشابه هذه الأعراض مع مشكلة أخرى؟','كيف أتابع حالتي بين الزيارات؟'],
  en:['What symptoms should prompt a specialist visit?','Which initial tests are commonly considered?','What safe steps may help improve symptoms?','When is medical follow-up important?','Which factors can increase the risk?','Which daily habits may support prevention?','How can mild and concerning cases differ?','What should I ask the specialist?','Can these symptoms overlap with another condition?','How should I monitor my condition between visits?'],
  de:['Welche Symptome erfordern eine fachärztliche Abklärung?','Welche ersten Untersuchungen sind üblich?','Welche sicheren Schritte können Beschwerden lindern?','Wann ist eine ärztliche Kontrolle wichtig?','Welche Faktoren erhöhen das Risiko?','Welche Gewohnheiten können vorbeugen?','Wie unterscheiden sich leichte und bedenkliche Verläufe?','Was sollte ich den Facharzt fragen?','Können die Symptome auch andere Ursachen haben?','Wie kann ich meinen Verlauf beobachten?'],
  ru:['Какие симптомы требуют обращения к специалисту?','Какие первичные обследования обычно нужны?','Что может безопасно помочь уменьшить симптомы?','Когда необходимо медицинское наблюдение?','Какие факторы повышают риск?','Какие привычки помогают профилактике?','Чем отличаются лёгкие и тревожные случаи?','Что спросить у специалиста?','Могут ли эти симптомы иметь другую причину?','Как наблюдать состояние между визитами?'],
  uk:['Які симптоми потребують звернення до спеціаліста?','Які первинні обстеження зазвичай потрібні?','Що може безпечно допомогти зменшити симптоми?','Коли потрібне медичне спостереження?','Які фактори підвищують ризик?','Які щоденні звички допомагають профілактиці?','Чим відрізняються легкі та тривожні випадки?','Що запитати у спеціаліста?','Чи можуть симптоми мати іншу причину?','Як спостерігати за станом між візитами?'],
  uz:['Qaysi alomatlar mutaxassisga murojaat qilishni talab qiladi?','Qaysi dastlabki tekshiruvlar odatda kerak?','Alomatlarni xavfsiz kamaytirishga nima yordam beradi?','Qachon tibbiy kuzatuv muhim?','Qaysi omillar xavfni oshiradi?','Qaysi kundalik odatlar profilaktikaga yordam beradi?','Yengil va xavotirli holatlar qanday farq qiladi?','Mutaxassisdan nimalarni so‘rash kerak?','Alomatlarning boshqa sababi bo‘lishi mumkinmi?','Tashriflar orasida holatni qanday kuzatish kerak?'],
  hy:['Ո՞ր ախտանիշները պահանջում են դիմել մասնագետի։','Ո՞ր նախնական հետազոտություններն են սովորաբար անհրաժեշտ։','Ի՞նչը կարող է անվտանգ նվազեցնել ախտանիշները։','Ե՞րբ է անհրաժեշտ բժշկական հսկողություն։','Ո՞ր գործոններն են բարձրացնում ռիսկը։','Ո՞ր ամենօրյա սովորություններն են օգնում կանխարգելմանը։','Ինչո՞վ են տարբերվում թեթև և մտահոգիչ դեպքերը։','Ի՞նչ հարցնել մասնագետին։','Կարո՞ղ են ախտանիշներն այլ պատճառ ունենալ։','Ինչպե՞ս հետևել վիճակին այցերի միջև։'],
  tg:['Кадом нишонаҳо муроҷиат ба мутахассисро талаб мекунанд?','Кадом ташхисҳои аввалия одатан заруранд?','Чӣ метавонад нишонаҳоро бехатар кам кунад?','Кай назорати тиббӣ муҳим аст?','Кадом омилҳо хавфро зиёд мекунанд?','Кадом одатҳои ҳаррӯза ба пешгирӣ кӯмак мекунанд?','Ҳолатҳои сабук ва нигаронкунанда чӣ фарқ доранд?','Аз мутахассис чӣ пурсидан лозим?','Оё нишонаҳо сабаби дигар дошта метавонанд?','Чӣ гуна ҳолатро байни боздидҳо назорат кардан мумкин аст?'],
  az:['Hansı simptomlar mütəxəssisə müraciət tələb edir?','İlkin hansı müayinələr adətən lazımdır?','Simptomları təhlükəsiz azaltmağa nə kömək edə bilər?','Nə vaxt tibbi müşahidə vacibdir?','Hansı amillər riski artırır?','Hansı gündəlik vərdişlər profilaktikaya kömək edir?','Yüngül və narahatedici hallar necə fərqlənir?','Mütəxəssisdən nə soruşmaq lazımdır?','Simptomların başqa səbəbi ola bilərmi?','Görüşlər arasında vəziyyəti necə izləmək olar?'],
  am:['የትኞቹ ምልክቶች የሕክምና ባለሙያ ግምገማ ያስፈልጋቸዋል?','የመጀመሪያ ምርመራዎች የትኞቹ ናቸው?','ምልክቶችን በደህና ለመቀነስ ምን ሊረዳ ይችላል?','የሕክምና ክትትል መቼ አስፈላጊ ነው?','የትኞቹ ምክንያቶች አደጋን ያድጋሉ?','የዕለት ተዕለት ልምዶች መከላከልን እንዴት ይረዳሉ?','ቀላል እና አሳሳቢ ሁኔታዎች እንዴት ይለያያሉ?','ለባለሙያ ምን መጠየቅ አለብኝ?','ምልክቶቹ ሌላ ምክንያት ሊኖራቸው ይችላል?','በጉብኝቶች መካከል ሁኔታዬን እንዴት እከታተላለሁ?'],
  ka:['რომელი სიმპტომები მოითხოვს სპეციალისტთან მიმართვას?','რომელი საწყისი გამოკვლევებია საჭირო?','რა შეიძლება დაეხმაროს სიმპტომების უსაფრთხოდ შემცირებას?','როდის არის სამედიცინო დაკვირვება მნიშვნელოვანი?','რომელი ფაქტორები ზრდის რისკს?','რომელი ყოველდღიური ჩვევები ეხმარება პრევენციას?','რით განსხვავდება მსუბუქი და საყურადღებო შემთხვევები?','რა უნდა ვკითხოთ სპეციალისტს?','შეიძლება სიმპტომებს სხვა მიზეზი ჰქონდეს?','როგორ დავაკვირდეთ მდგომარეობას ვიზიტებს შორის?'],
};

export function virtualQuestionsForSpecialty(slug:string,lang:string,count=50): Question[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const names=LANGUAGE_PROFILES[lang]?.names||LANGUAGE_PROFILES.ar.names;
  const templates=qTemplates[lang]||qTemplates.en;
  return Array.from({length:count},(_,i)=>({
    id:`catalog-q-${lang}-${slug}-${i+1}`, specialty_id:sp.id, author_name:lang==='ar'?'مستخدم SB1': 'SB1 User',
    title:`${templates[i%templates.length] || lc(lang).question}: ${localizedSpecialty(s,lang)} #${i+1}`,
    body:`${templates[i%templates.length] || lc(lang).question}. ${lc(lang).body} ${localizedSpecialty(s,lang)}.`,
    age:18+(i%55),gender:i%2?'أنثى':'ذكر',status:'answered',views:80+i*7,created_at:new Date(2026,0,1+(i%28)).toISOString(),specialty:sp,answers:Array.from({length:8},(_,j)=>({id:`catalog-answer-preview-${slug}-${lang}-${i+1}-${j+1}`})) as any
  }));
}

export function virtualAnswersForQuestion(question:Question,lang:string,count=8): Answer[] {
  const names=LANGUAGE_PROFILES[lang]?.names||LANGUAGE_PROFILES.en.names;
  return Array.from({length:Math.max(5,Math.min(20,count))},(_,i)=>({
    id:`${question.id}-answer-${i+1}`, question_id:question.id, doctor_id:`${question.id}-doctor-${i+1}`,
    body:lc(lang).answer,
    helpful_count:20+i*3,created_at:new Date().toISOString(),doctor:virtualDoctorsForSpecialty(question.specialty?.slug||'',lang,8)[i%8]
  }));
}

export function virtualArticlesForSpecialty(slug:string,lang:string,count=3): Article[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const doc=virtualDoctorsForSpecialty(slug,lang,5)[0]; const copy=lc(lang);
  const topics:any={ar:['الأعراض والعلامات المهمة','الفحوصات والتقييم','المتابعة والوقاية','متى يجب طلب المساعدة','أسئلة شائعة'],en:['Symptoms and warning signs','Evaluation and common tests','Follow-up and prevention','When to seek care','Frequently asked questions'],de:['Symptome und Warnzeichen','Untersuchung und Diagnostik','Nachsorge und Prävention','Wann Hilfe nötig ist','Häufige Fragen'],ru:['Симптомы и тревожные признаки','Обследование и диагностика','Наблюдение и профилактика','Когда обращаться за помощью','Частые вопросы']}[lang]||['Medical overview','Evaluation and tests','Follow-up','When to seek care','Frequently asked questions'];
  return Array.from({length:count},(_,i)=>({
    id:`catalog-art-${lang}-${slug}-${i+1}`,specialty_id:sp.id,doctor_id:doc.id,
    title:`${copy.article[i%copy.article.length]}: ${localizedSpecialty(s,lang)} — ${topics[i%topics.length]}`,
    excerpt:`${topics[i%topics.length]} — ${copy.body}`,
    body:`${topics[i%topics.length]}: ${localizedSpecialty(s,lang)}. ${copy.body} ${localizedSpecialty(s,lang)}. ${i%2===0?copy.body:''}`,
    image_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',reading_time_min:5+i,views:1000+i*300,created_at:new Date().toISOString(),specialty:sp,doctor:doc
  })) as Article[];
}

export function virtualVideosForSpecialty(slug:string,lang:string,count=2): DoctorVideo[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const doc=virtualDoctorsForSpecialty(slug,lang,5)[0];
  return Array.from({length:count},(_,i)=>({
    id:`catalog-vid-${lang}-${slug}-${i+1}`,doctor_id:doc.id,specialty_id:sp.id,
    title:`${lc(lang).video}: ${localizedSpecialty(s,lang)} — ${i+1}`,
    description:lc(lang).body,
    video_url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnail_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',duration_seconds:180,views:500+i*100,created_at:new Date().toISOString(),doctor:doc,specialty:sp
  }));
}

export function virtualAudioForSpecialty(slug:string,lang:string,count=2): DoctorAudio[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const doc=virtualDoctorsForSpecialty(slug,lang,5)[0];
  return Array.from({length:count},(_,i)=>({
    id:`catalog-audio-${lang}-${slug}-${i+1}`,doctor_id:doc.id,specialty_id:sp.id,
    title:`${lc(lang).audio}: ${localizedSpecialty(s,lang)} — ${i+1}`,
    description:lc(lang).body,
    audio_url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',duration_seconds:300,listens:200,created_at:new Date().toISOString(),doctor:doc,specialty:sp
  }));
}

export function virtualLibraryForSpecialty(slug:string,lang:string,count=2): SpecialtyLibraryItem[] {
  const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
  const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!;
  return Array.from({length:count},(_,i)=>({
    id:`catalog-book-${lang}-${slug}-${i+1}`,specialty_id:sp.id,item_type:'book',title:`${lc(lang).book}: ${localizedSpecialty(s,lang)} — ${i+1}`,
    description:lc(lang).body,url:null,image_url:null,source:'SB1 AI Editorial Library',is_auto_generated:true,created_at:new Date().toISOString(),specialty:sp
  })) as SpecialtyLibraryItem[];
}

const FACILITY_LABELS:any={
 ar:{clinic:'العيادات والمستشفيات',lab:'المختبرات',radiology:'مراكز الأشعة',elderly:'دور رعاية المسنين',pharmacy:'الصيدليات',addiction:'مراكز علاج الإدمان',rehab:'مراكز التأهيل والعلاج الطبيعي','medical-supplies':'الأدوات الطبية'},
 en:{clinic:'Clinics & Hospitals',lab:'Laboratories',radiology:'Radiology Centers',elderly:'Elderly Care Homes',pharmacy:'Pharmacies',addiction:'Addiction Treatment Centers',rehab:'Rehabilitation & Physiotherapy','medical-supplies':'Medical Supplies'},
 de:{clinic:'Kliniken und Krankenhäuser',lab:'Labore',radiology:'Radiologiezentren',elderly:'Seniorenpflege',pharmacy:'Apotheken',addiction:'Suchtbehandlungszentren',rehab:'Rehabilitation und Physiotherapie','medical-supplies':'Medizinische Hilfsmittel'},
 ru:{clinic:'Клиники и больницы',lab:'Лаборатории',radiology:'Радиологические центры',elderly:'Дома престарелых',pharmacy:'Аптеки',addiction:'Центры лечения зависимостей',rehab:'Реабилитация и физиотерапия','medical-supplies':'Медицинские товары'},
 uk:{clinic:'Клініки та лікарні',lab:'Лабораторії',radiology:'Радіологічні центри',elderly:'Будинки догляду',pharmacy:'Аптеки',addiction:'Центри лікування залежностей',rehab:'Реабілітація та фізіотерапія','medical-supplies':'Медичні товари'},
 uz:{clinic:'Klinikalar va shifoxonalar',lab:'Laboratoriyalar',radiology:'Radiologiya markazlari',elderly:'Keksalar parvarishi',pharmacy:'Dorixonalar',addiction:'Giyohvandlikni davolash markazlari',rehab:'Reabilitatsiya va fizioterapiya','medical-supplies':'Tibbiy buyumlar'},
 hy:{clinic:'Կլինիկաներ և հիվանդանոցներ',lab:'Լաբորատորիաներ',radiology:'Ռադիոլոգիայի կենտրոններ',elderly:'Տարեցների խնամք',pharmacy:'Դեղատներ',addiction:'Կախվածության բուժման կենտրոններ',rehab:'Վերականգնում և ֆիզիոթերապիա','medical-supplies':'Բժշկական պարագաներ'},
 tg:{clinic:'Клиникаҳо ва беморхонаҳо',lab:'Лабораторияҳо',radiology:'Марказҳои радиология',elderly:'Нигоҳубини пиронсолон',pharmacy:'Дорухонаҳо',addiction:'Марказҳои табобати вобастагӣ',rehab:'Барқарорсозӣ ва физиотерапия','medical-supplies':'Таҷҳизоти тиббӣ'},
 az:{clinic:'Klinikalar və xəstəxanalar',lab:'Laboratoriyalar',radiology:'Radiologiya mərkəzləri',elderly:'Yaşlılara qulluq',pharmacy:'Apteklər',addiction:'Asılılığın müalicəsi mərkəzləri',rehab:'Reabilitasiya və fizioterapiya','medical-supplies':'Tibbi ləvazimatlar'},
 am:{clinic:'ክሊኒኮች እና ሆስፒታሎች',lab:'ላቦራቶሪዎች',radiology:'የራዲዮሎጂ ማዕከላት',elderly:'የአረጋውያን እንክብካቤ',pharmacy:'ፋርማሲዎች',addiction:'የሱስ ሕክምና ማዕከላት',rehab:'ማገገሚያ እና ፊዚዮቴራፒ','medical-supplies':'የሕክምና መሳሪያዎች'},
 ka:{clinic:'კლინიკები და საავადმყოფოები',lab:'ლაბორატორიები',radiology:'რადიოლოგიის ცენტრები',elderly:'ხანდაზმულთა მოვლა',pharmacy:'აფთიაქები',addiction:'დამოკიდებულების მკურნალობის ცენტრები',rehab:'რეაბილიტაცია და ფიზიოთერაპია','medical-supplies':'სამედიცინო მოწყობილობები'}
};
export function virtualFacilities(lang:string, countryCode?:string): AdditionalFacility[] {
 const code=resolveCountryCode(countryCode||DEFAULT_COUNTRY_BY_LANG[lang]); const p=languageCountry(lang); const country=countryLabel(lang,code); const cities=citiesForCountry(code); const labels=FACILITY_LABELS[lang]||FACILITY_LABELS.en;
 return Object.keys(labels).flatMap((kind)=>Array.from({length:5},(_,i)=>({
   id:`catalog-fac-${lang}-${kind}-${code}-${i+1}`,facility_type:kind,
   name:`${labels[kind]} ${country} ${i+1}`,description:lc(lang).body+` ${country}.`,
   address:`${cities[i%Math.max(1,cities.length)]||p.city} - ${country} - SB1 Health District ${i+1}`,phone:null,email:null,logo_url:null,
   services:lang==='ar'?'حجز ومواعيد وخدمات وأسعار تجريبية':lang==='ru'?'Запись, услуги, цены и расписание':'Appointments, services, prices and schedules',
   schedule:{sun:'09:00-18:00',mon:'09:00-18:00',tue:'09:00-18:00',wed:'09:00-18:00',thu:'09:00-18:00'},rating:4.5+(i%4)/10,is_active:true,created_at:new Date().toISOString(),city:cities[i%Math.max(1,cities.length)]||p.city,country,language:lang
 })) as AdditionalFacility[]);
}


export function virtualCoursesForSpecialty(slug:string,lang:string,count=4) {
 const s=comprehensiveSpecialties.find(x=>x.slug===slug); if(!s) return [];
 const sp=specialtyCatalog(lang).find(x=>x.slug===slug)!; const doc=virtualDoctorsForSpecialty(slug,lang,5)[0];
 return Array.from({length:count},(_,i)=>({id:`catalog-course-${lang}-${slug}-${i+1}`,specialty_id:sp.id,doctor_id:doc.id,title:`${lc(lang).course}: ${localizedSpecialty(s,lang)} — ${i+1}`,description:`${lc(lang).body} ${localizedSpecialty(s,lang)}.`,image_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',price:19+i*10,duration_weeks:4+i,lessons_count:8+i*2,level:i===0?'beginner':i===1?'intermediate':'advanced',enrolled_count:100+i*50,rating:4.7,is_published:true,created_at:new Date().toISOString(),doctor:doc,specialty:sp}));
}
