import type { Doctor, Specialty, Question, Answer, Article, DoctorVideo, DoctorAudio, SpecialtyLibraryItem, AdditionalFacility, Course } from '@/lib/supabase';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';
import { ARAB_COUNTRIES } from '@/types/i18n';

export const LANGUAGE_PROFILES: Record<string,{country:string;city:string;native:string;names:string[];hospital?:string;rental?:string;sale?:string}> = {
 ar:{country:'سوريا',city:'دمشق',native:'العربية',names:['د. جمال نادي','د. أحمد خالد','د. سامر محمود','د. ياسر حسن','د. كريم علي','د. عمر يوسف','د. رامي أسعد','د. مازن خليل','د. خالد منصور','د. وليد عادل','د. حسام نجيب','د. طارق عبد الله']},
 en:{country:'United Kingdom',city:'London',native:'English',names:['Dr. James','Dr. Daniel Smith','Dr. Michael Brown','Dr. David Wilson','Dr. Robert Taylor','Dr. John Miller','Dr. William Davis','Dr. Thomas Moore','Dr. George Clark','Dr. Henry Lewis','Dr. Oliver Walker','Dr. Benjamin Hall']},
 de:{country:'Deutschland',city:'Berlin',native:'Deutsch',names:['Dr. James','Dr. Lukas Müller','Dr. Anna Schneider','Dr. Thomas Weber','Dr. Julia Fischer','Dr. Felix Wagner','Dr. Marie Becker','Dr. Paul Hoffmann','Dr. Laura Klein','Dr. Martin Bauer','Dr. Sophie Wolf','Dr. Daniel Koch']},
 ru:{country:'Россия',city:'Москва',native:'Русский',names:['ДОКТОР ДЖЕЙМС','Доктор Иван Петров','Доктор Анна Смирнова','Доктор Сергей Волков','Доктор Елена Кузнецова','Доктор Дмитрий Орлов','Доктор Мария Соколова','Доктор Алексей Морозов','Доктор Николай Фёдоров','Доктор Ольга Попова','Доктор Максим Лебедев','Доктор Ирина Васильева'],hospital:'Больница',rental:'Клиники и центры в аренду',sale:'Медицинские объекты на продажу'},
 uk:{country:'Україна',city:'Київ',native:'Українська',names:['Доктор Джеймс','Доктор Олександр Коваль','Доктор Анна Шевченко','Доктор Дмитро Бондар','Доктор Марія Ткач','Доктор Ірина Мельник','Доктор Андрій Левченко','Доктор Наталія Романюк','Доктор Сергій Бойко','Доктор Олена Кравець','Доктор Максим Петренко','Доктор Софія Гнатюк'],hospital:'Лікарня',rental:'Клініки та центри в оренду',sale:'Медичні об’єкти на продаж'},
 uz:{country:'O‘zbekiston',city:'Toshkent',native:'O‘zbekcha',names:['Doktor Jeyms','Doktor Aziz Karimov','Doktor Dilnoza Aliyeva','Doktor Bekzod Rahimov','Doktor Malika Xasanova','Doktor Sardor Yusupov','Doktor Nigora Tursunova','Doktor Kamol Ergashev','Doktor Jasur Abdullayev','Doktor Mohira Ismoilova','Doktor Ulug‘bek Qodirov','Doktor Zilola Rustamova'],hospital:'Shifoxona',rental:'Ijaraga klinikalar va markazlar',sale:'Sotiladigan tibbiy obyektlar'},
 hy:{country:'Հայաստան',city:'Երևան',native:'Հայերեն',names:['Դոկտոր Ջեյմս','Դոկտոր Արման Սարգսյան','Դոկտոր Աննա Մկրտչյան','Դոկտոր Հայկ Պետրոսյան','Դոկտոր Մարիամ Գրիգորյան','Դոկտոր Նարեկ Հովհաննիսյան','Դոկտոր Լիլիթ Կարապետյան','Դոկտոր Գոռ Մանուկյան','Դոկտոր Դավիթ Հարությունյան','Դոկտոր Էլինա Ավետիսյան','Դոկտոր Սամվել Մարտիրոսյան','Դոկտոր Նարե Խաչատրյան'],hospital:'Հիվանդանոց',rental:'Կլինիկաներ և կենտրոններ վարձակալությամբ',sale:'Բժշկական օբյեկտներ վաճառքի'},
tg:{country:'Тоҷикистон',city:'Душанбе',native:'Тоҷикӣ',names:['Доктор Ҷеймс','Доктор Фарид Саидов','Доктор Манижа Раҳимова','Доктор Камол Нуров','Доктор Меҳринисо Каримова','Доктор Ҷамшед Ҳусейнов','Доктор Шаҳноза Алиева','Доктор Беҳрӯз Давлатов','Доктор Рустам Нозиров','Доктор Зуҳро Сафарова','Доктор Сироҷиддин Ҳалимов','Доктор Мавлуда Қодирова'],hospital:'Беморхона',rental:'Клиникаҳо ва марказҳо барои иҷора',sale:'Объектҳои тиббӣ барои фурӯш'},
az:{country:'Azərbaycan',city:'Bakı',native:'Azərbaycan dili',names:['Doktor Ceyms','Doktor Elvin Məmmədov','Doktor Aysel Əliyeva','Doktor Murad Həsənov','Doktor Nigar Hüseynova','Doktor Kamran Rzayev','Doktor Leyla Quliyeva','Doktor Tural Abbasov','Doktor Orxan Əliyev','Doktor Günel Məmmədova','Doktor Rauf Hüseynov','Doktor Sevinc Qasımova'],hospital:'Xəstəxana',rental:'İcarəyə klinikalar və mərkəzlər',sale:'Satılan tibbi obyektlər'},
am:{country:'ኢትዮጵያ',city:'አዲስ አበባ',native:'አማርኛ',names:['ዶክተር ጄምስ','ዶክተር አበበ ተስፋዬ','ዶክተር ሚሚ አለሙ','ዶክተር ዳዊት በቀለ','ዶክተር ሳራ ገብረ','ዶክተር ናትናኤል ሀይሉ','ዶክተር ሜሮን አሰፋ','ዶክተር ዮሐንስ ከበደ','ዶክተር ሊዲያ ታደሰ','ዶክተር ሚካኤል ወልደ','ዶክተር ሄለን ገብረ','ዶክተር ሰለሞን አስፋው'],hospital:'ሆስፒታል',rental:'ክሊኒኮች እና ማዕከላት ለኪራይ',sale:'የሕክምና ቦታዎች ለሽያጭ'},
ka:{country:'საქართველო',city:'თბილისი',native:'ქართული',names:['დოქტორი ჯეიმსი','დოქტორი გიორგი ბერიძე','დოქტორი ნინო კაპანაძე','დოქტორი დავით მაისურაძე','დოქტორი მარიამ ჯაფარიძე','დოქტორი ლაშა ქავთარაძე','დოქტორი ანა გელაშვილი','დოქტორი ირაკლი ხუციშვილი','დოქტორი სალომე აბაშიძე','დოქტორი ნიკა კვარაცხელია','დოქტორი თაკო მჭედლიშვილი','დოქტორი ლევან ჩხეტიანი'],hospital:'საავადმყოფო',rental:'კლინიკები და ცენტრები ქირავდება',sale:'სამედიცინო ობიექტები გასაყიდად'},
};

export const languageCountry=(lang:string)=>LANGUAGE_PROFILES[lang]||LANGUAGE_PROFILES.ar;

const countryData:Record<string,{city:string;names:Record<string,string>}> = {
syria:{city:'دمشق',names:{ar:'سوريا',en:'Syria',de:'Syrien',ru:'Сирия',uk:'Сирія',uz:'Suriya',hy:'Սիրիա',tg:'Сурия',az:'Suriya',am:'ሶሪያ',ka:'სირია'}},
saudi:{city:'الرياض',names:{ar:'السعودية',en:'Saudi Arabia',de:'Saudi-Arabien',ru:'Саудовская Аравия',uk:'Саудівська Аравія',uz:'Saudiya Arabistoni',hy:'Սաուդյան Արաբիա',tg:'Арабистони Саудӣ',az:'Səudiyyə Ərəbistanı',am:'ሳውዲ አረቢያ',ka:'საუდის არაბეთი'}},
uae:{city:'دبي',names:{ar:'الإمارات',en:'United Arab Emirates',de:'Vereinigte Arabische Emirate',ru:'ОАЭ',uk:'ОАЕ',uz:'BAA',hy:'ԱՄԷ',tg:'АМА',az:'BƏƏ',am:'የኤምሬትስ',ka:'არაბთა გაერთიანებული საამიროები'}},
egypt:{city:'القاهرة',names:{ar:'مصر',en:'Egypt',de:'Ägypten',ru:'Египет',uk:'Єгипет',uz:'Misr',hy:'Եգիպտոս',tg:'Миср',az:'Misir',am:'ግብፅ',ka:'ეგვიპტე'}},
jordan:{city:'عمّان',names:{ar:'الأردن',en:'Jordan',de:'Jordanien',ru:'Иордания',uk:'Йорданія',uz:'Iordaniya',hy:'Հորդանան',tg:'Урдун',az:'İordaniya',am:'ዮርዳኖስ',ka:'იორდანია'}},
lebanon:{city:'بيروت',names:{ar:'لبنان',en:'Lebanon',de:'Libanon',ru:'Ливан',uk:'Ліван',uz:'Livan',hy:'Լիբանան',tg:'Лубнон',az:'Livan',am:'ሊባኖስ',ka:'ლიბანი'}},
iraq:{city:'بغداد',names:{ar:'العراق',en:'Iraq',de:'Irak',ru:'Ирак',uk:'Ірак',uz:'Iroq',hy:'Իրաք',tg:'Ироқ',az:'İraq',am:'ኢራቅ',ka:'ერაყი'}},
kuwait:{city:'الكويت',names:{ar:'الكويت',en:'Kuwait',de:'Kuwait',ru:'Кувейт',uk:'Кувейт',uz:'Quvayt',hy:'Քուվեյթ',tg:'Кувайт',az:'Küveyt',am:'ኩዌት',ka:'ქუვეითი'}},
libya:{city:'طرابلس',names:{ar:'ليبيا',en:'Libya',de:'Libyen',ru:'Ливия',uk:'Лівія',uz:'Liviya',hy:'Լիբիա',tg:'Лիբիա',az:'Liviya',am:'ሊቢያ',ka:'ლიბია'}},
morocco:{city:'الرباط',names:{ar:'المغرب',en:'Morocco',de:'Marokko',ru:'Марокко',uk:'Марокко',uz:'Marokash',hy:'Մարոկկո',tg:'Марокаш',az:'Mərakeş',am:'ሞሮኮ',ka:'მაროკო'}},
oman:{city:'مسقط',names:{ar:'عُمان',en:'Oman',de:'Oman',ru:'Оман',uk:'Оман',uz:'Ummon',hy:'Օման',tg:'Уմمون',az:'Oman',am:'ኦማን',ka:'ომანი'}},
palestine:{city:'القدس',names:{ar:'فلسطين',en:'Palestine',de:'Palästina',ru:'Палестина',uk:'Палестина',uz:'Falastin',hy:'Պաղեստին',tg:'Ֆալաստին',az:'Fələstin',am:'ፍልስጤም',ka:'პალესტინა'}},
qatar:{city:'الدوحة',names:{ar:'قطر',en:'Qatar',de:'Katar',ru:'Катар',uk:'Катар',uz:'Qatar',hy:'Կատար',tg:'Қатар',az:'Qətər',am:'ኳታር',ka:'კატარი'}},
tunisia:{city:'تونس',names:{ar:'تونس',en:'Tunisia',de:'Tunesien',ru:'Тунис',uk:'Туніс',uz:'Tunis',hy:'Թունիս',tg:'Тунис',az:'Tunis',am:'ቱኒዚያ',ka:'ტუნისი'}},
yemen:{city:'صنعاء',names:{ar:'اليمن',en:'Yemen',de:'Jemen',ru:'Йемен',uk:'Ємен',uz:'Yaman',hy:'Եմեն',tg:'Եմեն',az:'Yəmən',am:'የመን',ka:'იემენი'}},
algeria:{city:'الجزائر',names:{ar:'الجزائر',en:'Algeria',de:'Algerien',ru:'Алжир',uk:'Алжир',uz:'Jazoir',hy:'Ալժիր',tg:'Ալժիր',az:'Əlcəzair',am:'አልጄሪያ',ka:'ალჟირი'}},
bahrain:{city:'المنامة',names:{ar:'البحرين',en:'Bahrain',de:'Bahrain',ru:'Бахрейн',uk:'Бахрейн',uz:'Bahrayn',hy:'Բահրեյն',tg:'Բահրեյն',az:'Bəhreyn',am:'ባህሬን',ka:'ბაჰრეინი'}},
mauritania:{city:'نواكشوط',names:{ar:'موريتانيا',en:'Mauritania',de:'Mauretanien',ru:'Мавритания',uk:'Мавританія',uz:'Mavritaniya',hy:'Մավրիտանիա',tg:'Мавритания',az:'Mavritaniya',am:'ሞሪታኒያ',ka:'მავრიტანია'}},
comoros:{city:'موروني',names:{ar:'جزر القمر',en:'Comoros',de:'Komoren',ru:'Коморы',uk:'Комори',uz:'Komor orollari',hy:'Կոմորներ',tg:'Коморҳо',az:'Komor adaları',am:'ኮሞሮስ',ka:'კომორის კუნძულები'}},
djibouti:{city:'جيبوتي',names:{ar:'جيبوتي',en:'Djibouti',de:'Dschibuti',ru:'Джибути',uk:'Джибუტі',uz:'Jibuti',hy:'Ջիբութի',tg:'Ҷибутӣ',az:'Cibuti',am:'ጅቡቲ',ka:'ჯიბუტი'}},
sudan:{city:'الخرطوم',names:{ar:'السودان',en:'Sudan',de:'Sudan',ru:'Судан',uk:'Судан',uz:'Sudan',hy:'Սուդան',tg:'Սուդան',az:'Sudan',am:'ሱዳን',ka:'სუდანი'}},
somalia:{city:'مقديشو',names:{ar:'الصومال',en:'Somalia',de:'Somalia',ru:'Сомали',uk:'Сомалі',uz:'Somali',hy:'Սոմալի',tg:'Soomaaliya',az:'Somali',am:'ሶማሊያ',ka:'სომალი'}},
germany:{city:'Berlin',names:{ar:'ألمانيا',en:'Germany',de:'Deutschland',ru:'Германия',uk:'Німеччина',uz:'Germaniya',hy:'Գերմանիա',tg:'Олмон',az:'Almaniya',am:'ጀርመን',ka:'გერმანია'}},
austria:{city:'Wien',names:{ar:'النمسا',en:'Austria',de:'Österreich',ru:'Австрия',uk:'Австрія',uz:'Avstriya',hy:'Ավստրիա',tg:'Австрия',az:'Avstriya',am:'ኦስትሪያ',ka:'ავსტრია'}},
switzerland:{city:'Zürich',names:{ar:'سويسرا',en:'Switzerland',de:'Schweiz',ru:'Швейцария',uk:'Швейцарія',uz:'Shveytsariya',hy:'Շվեյցարիա',tg:'Швейтсария',az:'İsveçrə',am:'ስዊዘርላንድ',ka:'შვეიცარია'}},
russia:{city:'Москва',names:{ar:'روسيا',en:'Russia',de:'Russland',ru:'Россия',uk:'Росія',uz:'Rossiya',hy:'Ռուսաստան',tg:'Русия',az:'Rusiya',am:'ሩሲያ',ka:'რუსეთი'}},
ukraine:{city:'Київ',names:{ar:'أوكرانيا',en:'Ukraine',de:'Ukraine',ru:'Украина',uk:'Україна',uz:'Ukraina',hy:'Ուկրաինա',tg:'Украина',az:'Ukrayna',am:'ዩክሬን',ka:'უკრაინა'}},
uzbekistan:{city:'Toshkent',names:{ar:'أوزبكستان',en:'Uzbekistan',de:'Usbekistan',ru:'Узбекистан',uk:'Узбекистан',uz:'O‘zbekiston',hy:'Ուզբեկստան',tg:'Ӯзбекистон',az:'Özbəkistan',am:'ኡዝբեկستان',ka:'უზბეკეთი'}},
armenia:{city:'Երևան',names:{ar:'أرمينيا',en:'Armenia',de:'Armenien',ru:'Армения',uk:'Вірменія',uz:'Armaniston',hy:'Հայաստան',tg:'Арманистон',az:'Ermənistan',am:'አርማնիა',ka:'სომხეთი'}},
tajikistan:{city:'Душанбе',names:{ar:'طاجيكستان',en:'Tajikistan',de:'Tadschikistan',ru:'Таджикистан',uk:'Таджикистан',uz:'Tojikiston',hy:'Տաջիկստան',tg:'Тоҷикистон',az:'Tacikistan',am:'ታጂኪስታን',ka:'ტაჯიკეთი'}},
azerbaijan:{city:'Bakı',names:{ar:'أذربيجان',en:'Azerbaijan',de:'Aserbaidschan',ru:'Азербайджан',uk:'Азербайджан',uz:'Ozarbayjon',hy:'Ադրբեջան',tg:'Озарбойҷон',az:'Azərbaycan',am:'አዘርባጃን',ka:'აზერბაიჯანი'}},
georgia:{city:'თბილისი',names:{ar:'جورجيا',en:'Georgia',de:'Georgien',ru:'Грузия',uk:'Грузія',uz:'Gruziya',hy:'Վրաստան',tg:'Гурҷистон',az:'Gürcüstan',am:'ጆርጂያ',ka:'საქართველო'}},
ethiopia:{city:'አዲስ አበባ',names:{ar:'إثيوبيا',en:'Ethiopia',de:'Äthiopien',ru:'Эфиопия',uk:'Ефіопія',uz:'Efiopiya',hy:'Եթովպիա',tg:'Эфиопия',az:'Efiopiya',am:'ኢትዮጵያ',ka:'ეთიოპია'}},
uk:{city:'London',names:{ar:'بريطانيا',en:'United Kingdom',de:'Vereinigtes Königreich',ru:'Великобритания',uk:'Велика Британія',uz:'Buyuk Britaniya',hy:'Միացյալ Թագավորություն',tg:'Британияи Кабир',az:'Böyük Britaniya',am:'ዩናይትድ ኪንግደም',ka:'გაერთიანებული სამეფო'}},
usa:{city:'New York',names:{ar:'الولايات المتحدة',en:'United States',de:'Vereinigte Staaten',ru:'США',uk:'США',uz:'AQSh',hy:'ԱՄՆ',tg:'ИМА',az:'ABŞ',am:'አմերիկա',ka:'აშშ'}},
canada:{city:'Toronto',names:{ar:'كندا',en:'Canada',de:'Kanada',ru:'Канада',uk:'Канада',uz:'Kanada',hy:'Կանադա',tg:'Канада',az:'Kanada',am:'ካናዳ',ka:'კანადა'}}
};
const arabCountryNames:Record<string,string>={SA:'السعودية',AE:'الإمارات',EG:'مصر',IQ:'العراق',JO:'الأردن',KW:'الكويت',LB:'لبنان',LY:'ليبيا',MA:'المغرب',OM:'عُمان',PS:'فلسطين',QA:'قطر',SY:'سوريا',TN:'تونس',YE:'اليمن',DZ:'الجزائر',BH:'البحرين',MR:'موريتانيا',KM:'جزر القمر',DJ:'جيبوتي',SD:'السودان',SO:'الصومال'};
const arabCountryCities:Record<string,string>={SA:'الرياض',AE:'دبي',EG:'القاهرة',IQ:'بغداد',JO:'عمّان',KW:'الكويت',LB:'بيروت',LY:'طرابلس',MA:'الرباط',OM:'مسقط',PS:'القدس',QA:'الدوحة',SY:'دمشق',TN:'تونس',YE:'صنعاء',DZ:'الجزائر',BH:'المنامة',MR:'نواكشوط',KM:'موروني',DJ:'جيبوتي',SD:'الخرطوم',SO:'مقديشو'};
export function countriesForLanguage(lang:string){
 if(lang==='ar') return ARAB_COUNTRIES.map(c=>({key:c.code,name:arabCountryNames[c.code]||c.code,city:arabCountryCities[c.code]||''}));
 const preferred=lang==='ru'?['russia','ukraine']:lang==='hy'?['armenia','georgia','russia']:lang==='ka'?['georgia','armenia']:lang==='uz'?['uzbekistan','russia']:lang==='de'?['germany','austria','switzerland']:['uk','usa','canada'];
 return preferred.map(k=>({key:k,name:countryData[k]?.names[lang]||countryData[k]?.names.en||k,city:countryData[k]?.city||''}));
}

export function localizedSpecialty(s:any,lang:string){
 return s?.[lang] || (lang==='ar'?s.ar:lang==='de'?s.de:lang==='ru'?s.ru:s.en) || s.ar;
}
export function specialtyCatalog(lang:string): Specialty[] {
 return comprehensiveSpecialties.map((s,i)=>({id:`catalog-sp-${s.slug}`,slug:s.slug,name:localizedSpecialty(s,lang),icon:'Stethoscope',description:localizedSpecialty(s,lang),name_en:s.en,name_de:s.de,name_ru:s.ru,description_en:s.en,description_de:s.de,description_ru:s.ru,created_at:new Date(2026,0,1+i).toISOString()}));
}

const localized:Record<string,{question:string;answer:string;articleIntro:string;articleEnd:string;book:string;audio:string;video:string;course:string;virtual:string}> = {
 ar:{question:'ما المعلومات المهمة التي يجب معرفتها حول',answer:'إجابة تثقيفية تجريبية: تختلف الخطوات حسب التاريخ المرضي والأعراض والفحص. هذه معلومات عامة وليست تشخيصاً فردياً.',articleIntro:'مقال طبي تثقيفي يشرح التعريف والأعراض وعوامل الخطورة والتقييم والمتابعة.',articleEnd:'المحتوى للتثقيف العام ويحتاج مراجعة مختص قبل اعتماده كمرجع طبي.',book:'دليل طبي',audio:'دليل صوتي',video:'شرح طبي مبسط',course:'دورة تدريبية',virtual:'أخصائي افتراضي تعليمي'},
 en:{question:'What important information should be known about',answer:'Educational demo answer: the appropriate approach depends on the history, symptoms and examination. This is general information, not an individual diagnosis.',articleIntro:'A medical education article covering definition, symptoms, risk factors, evaluation and follow-up.',articleEnd:'For general education and editorial review; it is not individual diagnosis or treatment.',book:'Medical Handbook',audio:'Audio Guide',video:'Medical Explainer',course:'Training Course',virtual:'Virtual educational specialist'},
 de:{question:'Welche wichtigen Informationen sollte man über',answer:'Beispielhafte Bildungsantwort: Das Vorgehen hängt von Vorgeschichte, Symptomen und Untersuchung ab. Dies ist keine individuelle Diagnose.',articleIntro:'Ein medizinischer Bildungsartikel zu Definition, Symptomen, Risikofaktoren, Abklärung und Verlauf.',articleEnd:'Zur allgemeinen Information und redaktionellen Prüfung; keine individuelle Diagnose oder Therapie.',book:'Medizinisches Handbuch',audio:'Audio-Ratgeber',video:'Medizinische Erklärung',course:'Fortbildungskurs',virtual:'Virtueller Bildungsspezialist'},
 ru:{question:'Какая важная информация нужна о',answer:'Учебный демонстрационный ответ: тактика зависит от анамнеза, симптомов и обследования. Это общая информация, а не индивидуальный диагноз.',articleIntro:'Медицинская образовательная статья о понятии, симптомах, факторах риска, обследовании и наблюдении.',articleEnd:'Для общего образования и редакторской проверки; не является индивидуальной диагностикой или лечением.',book:'Медицинское руководство',audio:'Аудиогид',video:'Медицинское объяснение',course:'Учебный курс',virtual:'Виртуальный образовательный специалист'},
 uk:{question:'Яку важливу інформацію потрібно знати про',answer:'Демонстраційна освітня відповідь: тактика залежить від анамнезу, симптомів та обстеження. Це загальна інформація, а не індивідуальний діагноз.',articleIntro:'Медична освітня стаття про визначення, симптоми, фактори ризику, обстеження та спостереження.',articleEnd:'Для загальної освіти та редакційної перевірки; не є індивідуальною діагностикою чи лікуванням.',book:'Медичний посібник',audio:'Аудіогід',video:'Медичне пояснення',course:'Навчальний курс',virtual:'Віртуальний освітній спеціаліст'},
 uz:{question:'haqida qanday muhim maʼlumotlarni bilish kerak',answer:'Taʼlimiy demo javob: yondashuv anamnez, alomatlar va tekshiruvga bog‘liq. Bu umumiy maʼlumot, individual tashxis emas.',articleIntro:'Tibbiy maqola: taʼrif, belgilar, xavf omillari, tekshiruv va kuzatuv.',articleEnd:'Umumiy taʼlim va tahririy tekshiruv uchun; individual tashxis yoki davolash emas.',book:'Tibbiy qo‘llanma',audio:'Audio qo‘llanma',video:'Tibbiy tushuntirish',course:'O‘quv kursi',virtual:'Virtual taʼlim mutaxassisi'},
 hy:{question:'Ի՞նչ կարևոր տեղեկություններ պետք է իմանալ',answer:'Ուսուցողական օրինակային պատասխան. մոտեցումը կախված է պատմությունից, ախտանիշներից և զննությունից։ Սա ընդհանուր տեղեկատվություն է, ոչ անհատական ախտորոշում։',articleIntro:'Բժշկական կրթական հոդված՝ սահմանման, ախտանիշների, ռիսկերի, հետազոտության և հետևման մասին։',articleEnd:'Ընդհանուր կրթական նյութ է և պահանջում է մասնագիտական խմբագրական ստուգում։',book:'Բժշկական ուղեցույց',audio:'Աուդիո ուղեցույց',video:'Բժշկական բացատրություն',course:'Ուսուցման դասընթաց',virtual:'Վիրտուալ կրթական մասնագետ'},
 tg:{question:'Кадом маълумоти муҳимро дар бораи',answer:'Ҷавоби намунавии омӯзишӣ: равиш аз таърихча, нишонаҳо ва муоина вобаста аст. Ин маълумоти умумӣ аст, на ташхиси инфиродӣ.',articleIntro:'Мақолаи тиббии таълимӣ дар бораи таъриф, нишонаҳо, омилҳои хатар, ташхис ва пайгирӣ.',articleEnd:'Барои омӯзиши умумӣ ва санҷиши таҳрирӣ; ташхис ё табобати инфиродӣ нест.',book:'Роҳнамои тиббӣ',audio:'Роҳнамои аудиоӣ',video:'Шарҳи тиббӣ',course:'Курси омӯзишӣ',virtual:'Мутахассиси виртуалии таълимӣ'},
 az:{question:'haqqında hansı vacib məlumatları bilmək lazımdır',answer:'Tədris nümunəsi cavab: yanaşma anamnez, simptomlar və müayinədən asılıdır. Bu ümumi məlumatdır, fərdi diaqnoz deyil.',articleIntro:'Tibbi maarifləndirici məqalə: tərif, simptomlar, risklər, müayinə və izləmə.',articleEnd:'Ümumi maarifləndirmə və redaktə yoxlaması üçündür; fərdi diaqnoz və müalicə deyil.',book:'Tibbi bələdçi',audio:'Audio bələdçi',video:'Tibbi izah',course:'Təlim kursu',virtual:'Virtual təhsil mütəxəssisi'},
 am:{question:'ስለ ምን አስፈላጊ መረጃ መታወቅ አለበት',answer:'የትምህርት ምሳሌ መልስ፦ አቀራረቡ በታሪክ፣ ምልክቶች እና ምርመራ ይወሰናል። ይህ አጠቃላይ መረጃ ነው።',articleIntro:'የሕክምና ትምህርታዊ ጽሑፍ፣ ትርጉም፣ ምልክቶች፣ አደጋዎች፣ ምርመራ እና ክትትልን ይሸፍናል።',articleEnd:'ለአጠቃላይ ትምህርት እና ለአርትኦት ምርመራ ብቻ ነው።',book:'የሕክምና መመሪያ',audio:'የድምጽ መመሪያ',video:'የሕክምና ማብራሪያ',course:'የስልጠና ኮርስ',virtual:'ምናባዊ የትምህርት ባለሙያ'},
 ka:{question:'რა მნიშვნელოვანი ინფორმაცია უნდა ვიცოდეთ',answer:'სასწავლო პასუხი: მიდგომა დამოკიდებულია ისტორიაზე, სიმპტომებსა და გამოკვლევაზე. ეს ზოგადი ინფორმაციაა და არა ინდივიდუალური დიაგნოზი.',articleIntro:'სამედიცინო საგანმანათლებლო სტატია განმარტებაზე, სიმპტომებზე, რისკებზე, გამოკვლევასა და მონიტორინგზე.',articleEnd:'ზოგადი განათლებისთვის და რედაქტორული შემოწმებისთვის; არ წარმოადგენს ინდივიდუალურ დიაგნოზს ან მკურნალობას.',book:'სამედიცინო სახელმძღვანელო',audio:'აუდიო გზამკვლევი',video:'სამედიცინო ახსნა',course:'სასწავლო კურსი',virtual:'ვირტუალური საგანმანათლებლო სპეციალისტი'}
};

function L(lang:string){return localized[lang]||localized.en}
function namesFor(lang:string){return LANGUAGE_PROFILES[lang]?.names||LANGUAGE_PROFILES.en.names}
function spec(slug:string){return comprehensiveSpecialties.find(x=>x.slug===slug)}
function sp(lang:string,slug:string){return specialtyCatalog(lang).find(x=>x.slug===slug)!}

const doctorPhotoPool=[
 '/jamal-james.jpg',
 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1666887360389-0f4f5c9e0c9a?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1643297654413-6f6f6b8e2a2d?auto=format&fit=crop&w=600&q=85',
 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&w=600&q=85',
];
export function virtualDoctorsForSpecialty(slug:string,lang:string,count=10,countryKey?:string):Doctor[]{
 const s=spec(slug);if(!s)return[];const specialty=sp(lang,slug);const base=countryKey&&countryData[countryKey]?countryData[countryKey]:null;
 const arab=countryKey&&arabCountryNames[countryKey]?arabCountryNames[countryKey]:null;
 const p=base?{country:base.names[lang]||base.names.en,city:base.city,native:LANGUAGE_PROFILES[lang]?.native||'English'}:arab?{country:arab,city:arabCountryCities[countryKey!]||'',native:LANGUAGE_PROFILES[lang]?.native||'العربية'}:languageCountry(lang);const names=namesFor(lang);
 return Array.from({length:Math.max(5,Math.min(25,count))},(_,i)=>({id:`catalog-doctor-${lang}-${slug}-${i+1}`,name:(slug==='clinical-psychology'&&i===0)?names[0]:names[(i+1)%names.length],specialty_id:specialty.id,
 bio:i===0?(lang==='ar'?'طبيب نفسي، أخصائي نفسي، أخصائي علم الجنس، أخصائي نفسي عصبي وABA · خبرة 17 سنة · متابعون كثيرون. ملف تجريبي تعليمي.':lang==='ru'?'Психиатр, психолог, сексолог, нейропсихолог и специалист ABA · 17 лет опыта · много подписчиков. Учебный демонстрационный профиль.':lang==='de'?'Psychiater, Psychologe, Sexualtherapeut, Neuropsychologe und ABA-Spezialist · 17 Jahre Erfahrung · viele Follower. Demo-Lernprofil.':lang==='en'?'Psychiatrist, psychologist, sexologist, neuropsychologist and ABA specialist · 17 years of experience · many followers. Educational demo profile.':'17 years of experience · multidisciplinary mental-health specialist · educational demo profile.'):(L(lang).virtual+' في '+localizedSpecialty(s,lang)+'. '+(lang==='ar'?'ملف افتراضي تعليمي وليس شخصاً حقيقياً ولا يمثل ترخيصاً مهنياً.':'Educational virtual profile, not a real person and not a professional license.')),
 education:'SB1 Virtual Specialist Program',experience_years:i===0?17:5+(i%18),photo_url:(slug==='clinical-psychology'&&i===0)?'/jamal-james.jpg':doctorPhotoPool[(i+1)%doctorPhotoPool.length],city:p.city,rating:4.5+(i%5)/10,consultation_count:120+i*31,age:30+(i%21),gender:i%2===0?'male':'female',native_language:lang,is_online:i%3!==0,is_verified:false,is_virtual:true,phone_number:null,consultation_price:15+(i%6)*10,session_price:35+(i%8)*10,
 follower_count:i===0?98500:500+i*77,nationality:p.country,created_at:new Date(2026,0,1+i).toISOString(),specialty} as Doctor));
}
export function bookableDemoDoctorsForSpecialty(slug:string,lang:string,count=10,countryKey?:string):Doctor[]{
 const docs=virtualDoctorsForSpecialty(slug,lang,count,countryKey);
 return docs.map((d:any)=>({...d,is_virtual:false,is_verified:false,bio:(d.bio||'')+' حساب تجريبي قابل للحجز في نسخة SB1 التجريبية وليس ملفاً لممارس حقيقي.'}));
}

const questionScenarios:any={
 ar:[
  'أعاني منذ عدة أيام من أعراض مرتبطة بـ {s}، وتزداد في المساء. ما الفحوصات الأولية التي عادةً يناقشها الطبيب؟',
  'لدي أعراض متكررة في {s} وأشعر أنها تتحسن ثم تعود. هل هذا يستدعي مراجعة مختص وما العلامات التي تستوجب سرعة التقييم؟',
  'أجريت تحليلاً أو فحصاً وكانت النتيجة غير طبيعية في شيء يتعلق بـ {s}. كيف أفهم النتيجة وما المعلومات التي يجب أن أحضرها للطبيب؟',
  'أستخدم دواءً حالياً وظهرت لدي أعراض جديدة. هل يمكن أن يكون هناك ارتباط بالدواء، وما الذي يجب تجنبه قبل سؤال الطبيب؟',
  'طفلي يعاني من مشكلة قد تكون مرتبطة بـ {s}. ما العلامات التي تستدعي تقييم طبيب أطفال أو أخصائي؟',
  'أنا حامل ولدي أعراض مرتبطة بـ {s}. ما الأسئلة المهمة التي أطرحها على الطبيب قبل تناول أي دواء أو إجراء؟',
  'ما الفرق بين الأسباب الشائعة والأسباب التي تحتاج فحوصات إضافية عند ظهور أعراض مرتبطة بـ {s}؟',
  'أعاني من أعراض منذ فترة طويلة وأثر ذلك على نومي أو عملي. ما الخطوة العملية الأولى للحصول على تقييم مناسب لـ {s}؟',
  'هل توجد تغييرات في النوم أو الغذاء أو النشاط قد تساعد في التعامل مع أعراض {s}، ومتى لا تكفي هذه التغييرات وحدها؟',
  'لدي أكثر من عرض في الوقت نفسه ولا أعرف هل هي مشكلة واحدة أم عدة مشاكل مرتبطة بـ {s}. كيف يقيّم الطبيب الحالة؟'
 ],
 en:[
  'For several days I have had symptoms related to {s}, worse in the evening. What initial evaluation is usually discussed?',
  'My symptoms related to {s} keep improving and returning. When should I see a specialist and what warning signs matter?',
  'I had a test or scan related to {s} with an abnormal result. How should I understand it and what records should I bring?',
  'I take a medication and developed new symptoms. Could there be a medication connection and what should I discuss before changing it?',
  'My child has a problem that may be related to {s}. Which signs should prompt a pediatric or specialist assessment?',
  'I am pregnant and have symptoms related to {s}. What should I ask my clinician before taking any medicine or having a procedure?',
  'What is the difference between common causes and causes that need additional testing when symptoms involve {s}?',
  'Symptoms have lasted for weeks and affect my sleep or work. What is a practical first step for a {s} evaluation?',
  'Can sleep, diet or activity changes help with {s}, and when are lifestyle measures not enough?',
  'I have several symptoms at once and cannot tell whether they are connected to {s}. How is this usually assessed?'
 ],
 ru:[
  'У меня несколько дней симптомы, связанные с «{s}», и вечером они усиливаются. Какое первичное обследование обычно обсуждают?',
  'Симптомы, связанные с «{s}», то проходят, то возвращаются. Когда нужен специалист и какие признаки требуют быстрой оценки?',
  'Я сделал анализ или исследование по поводу «{s}», результат оказался необычным. Как его понимать и какие документы показать врачу?',
  'Я принимаю лекарство и появились новые симптомы. Может ли это быть связано с препаратом и что обсудить с врачом до изменения лечения?',
  'У ребёнка проблема, которая может быть связана с «{s}». Какие признаки требуют оценки педиатра или специалиста?',
  'Я беременна и у меня симптомы, связанные с «{s}». Что важно спросить врача до лекарства или процедуры?',
  'Чем отличаются частые причины симптомов при «{s}» от ситуаций, когда нужны дополнительные обследования?',
  'Симптомы продолжаются и мешают сну или работе. Какой первый практический шаг нужен для оценки «{s}»?',
  'Могут ли сон, питание и активность помочь при «{s}» и когда этого недостаточно?',
  'У меня несколько симптомов одновременно. Как врач определяет, связаны ли они с «{s}»?'
 ],
 de:[
  'Seit einigen Tagen habe ich Beschwerden im Zusammenhang mit {s}, abends stärker. Welche erste Abklärung wird üblicherweise besprochen?',
  'Die Beschwerden bei {s} kommen immer wieder. Wann ist eine fachärztliche Abklärung sinnvoll und welche Warnzeichen sind wichtig?',
  'Eine Untersuchung zu {s} war auffällig. Wie lässt sich der Befund einordnen und welche Unterlagen sollte ich mitbringen?',
  'Ich nehme ein Medikament und habe neue Beschwerden bekommen. Kann ein Zusammenhang bestehen und was sollte ich vor einer Änderung klären?',
  'Mein Kind hat ein Problem, das mit {s} zusammenhängen könnte. Welche Zeichen sprechen für eine kinderärztliche Abklärung?',
  'Ich bin schwanger und habe Beschwerden im Zusammenhang mit {s}. Was sollte ich vor Medikamenten oder einer Untersuchung fragen?',
  'Was unterscheidet häufige Ursachen von Situationen, in denen bei {s} weitere Untersuchungen nötig sind?',
  'Die Beschwerden bestehen länger und beeinträchtigen Schlaf oder Arbeit. Was ist der erste sinnvolle Schritt bei {s}?',
  'Können Schlaf, Ernährung oder Bewegung bei {s} helfen und wann reichen diese Maßnahmen nicht aus?',
  'Ich habe mehrere Beschwerden gleichzeitig. Wie prüft ein Arzt, ob sie mit {s} zusammenhängen?'
 ]
};
const genericScenarioMap:any={uk:questionScenarios.ru,uz:questionScenarios.en,hy:questionScenarios.en,tg:questionScenarios.ru,az:questionScenarios.en,am:questionScenarios.en,ka:questionScenarios.en};

export function virtualQuestionsForSpecialty(slug:string,lang:string,count=50):Question[]{
 const s=spec(slug);if(!s)return[];const specialty=sp(lang,slug);const bank=questionScenarios[lang]||genericScenarioMap[lang]||questionScenarios.en;
 return Array.from({length:count},(_,i)=>{const body=bank[i%bank.length].replaceAll('{s}',localizedSpecialty(s,lang));const title=body.split(/[؟?]/)[0].slice(0,110);
 const q:any={id:`catalog-q-${lang}-${slug}-${i+1}`,specialty_id:specialty.id,author_name:lang==='ar'?'مستخدم SB1':'SB1 User',title,body,age:18+(i%55),gender:i%2?'أنثى':'ذكر',status:'answered',views:80+i*7,created_at:new Date(2026,0,1+(i%28)).toISOString(),specialty:specialty,language:lang};
 q.answer_count=5+(i%16);return q});
}
const answerTemplates:any={
 ar:[
  'الأعراض المذكورة لها أكثر من احتمال، ولا يمكن تحديد السبب أو الجرعة من النص وحده. الأفضل جمع مدة الأعراض، الأدوية الحالية، الأمراض السابقة ونتائج الفحوصات ومناقشتها مع المختص.',
  'إذا كانت النتيجة أو الأعراض جديدة، فالأولوية لفهم السياق السريري كاملاً قبل اتخاذ قرار علاجي. لا تغيّر دواءً موصوفاً دون التواصل مع الطبيب.',
  'قد يحتاج الطبيب إلى فحص مباشر أو تحليل إضافي حسب العمر والأعراض والعلامات المصاحبة. وجود ألم شديد أو تدهور سريع أو صعوبة تنفس يستدعي تقييماً عاجلاً.',
  'يمكن أن تساعد متابعة الأعراض وتسجيل وقت ظهورها والعوامل التي تزيدها أو تخففها في الوصول إلى تقييم أدق.',
  'هذه إجابة تعليمية تجريبية في SB1 وليست تشخيصاً أو وصفة شخصية. يمكن فتح جلسة مع أخصائي لمراجعة الحالة بالتفصيل.'
 ],
 en:[
  'These symptoms can have several causes, and a diagnosis or medication dose cannot be determined from a text alone. Bring the timeline, current medicines, past conditions and test results to a clinician.',
  'A new or abnormal result needs clinical context before treatment decisions are made. Do not change a prescribed medicine without speaking with the clinician who manages it.',
  'A clinician may need an examination or additional testing depending on age, symptoms and associated signs. Severe pain, rapid deterioration or breathing difficulty needs urgent assessment.',
  'Tracking when symptoms occur and what makes them better or worse can help a clinician reach a clearer assessment.',
  'This is an educational SB1 demo answer, not a personal diagnosis or prescription. A specialist session can be used for a full review.'
 ],
 ru:[
  'У этих симптомов может быть несколько причин; по одному тексту нельзя определить диагноз или дозу препарата. Подготовьте историю симптомов, лекарства и результаты обследований.',
  'Новый или необычный результат нужно оценивать с учётом всей клинической картины. Не меняйте назначенное лекарство без связи с врачом.',
  'В зависимости от возраста и симптомов врачу может понадобиться осмотр или дополнительное обследование. Сильная боль, быстрое ухудшение или затруднение дыхания требуют срочной оценки.',
  'Полезно записывать время появления симптомов и факторы, которые их усиливают или уменьшают.',
  'Это учебный демонстрационный ответ SB1, а не индивидуальный диагноз или назначение лечения.'
 ],
 de:[
  'Die Beschwerden können verschiedene Ursachen haben; aus einem Text allein lassen sich Diagnose oder Dosierung nicht sicher ableiten. Bringen Sie Verlauf, Medikamente und Befunde zur Untersuchung mit.',
  'Ein neuer oder auffälliger Befund sollte im klinischen Zusammenhang bewertet werden. Verordnete Medikamente nicht ohne Rücksprache ändern.',
  'Je nach Alter und Beschwerden können Untersuchung oder weitere Tests erforderlich sein. Starke Schmerzen, schnelle Verschlechterung oder Atemnot erfordern eine zeitnahe Abklärung.',
  'Notieren Sie Beginn, Verlauf und auslösende oder lindernde Faktoren der Beschwerden.',
  'Dies ist eine lehrorientierte SB1-Demoantwort und keine individuelle Diagnose oder Therapieempfehlung.'
 ]
};
const genericAnswers:any={uk:answerTemplates.ru,uz:answerTemplates.en,hy:answerTemplates.en,tg:answerTemplates.ru,az:answerTemplates.en,am:answerTemplates.en,ka:answerTemplates.en};
export function virtualAnswersForQuestion(question:Question,lang:string,count=8):Answer[]{
 const slug=question.specialty?.slug||question.specialty_id.replace(/^catalog-sp-/,'');const docs=virtualDoctorsForSpecialty(slug,lang,Math.max(5,count));const bank=answerTemplates[lang]||genericAnswers[lang]||answerTemplates.en;
 return Array.from({length:Math.max(5,Math.min(20,count))},(_,i)=>({id:`${question.id}-answer-${i+1}`,question_id:question.id,doctor_id:docs[i%docs.length].id,body:bank[i%bank.length],helpful_count:20+i*3,created_at:new Date(2026,0,2+i).toISOString(),doctor:docs[i%docs.length]}));
}
const articleTopics=['التعريف والمفاهيم الأساسية','الأعراض والعلامات الشائعة','عوامل الخطورة والوقاية','التقييم والفحوصات والمتابعة','العلاج والتعايش ونمط الحياة'];
const articleSections:any={ar:['التعريف','الأعراض والعلامات','عوامل الخطورة','التقييم والتشخيص','التعامل والمتابعة','متى تطلب مساعدة عاجلة'],en:['Definition','Symptoms and signs','Risk factors','Evaluation and diagnosis','Management and follow-up','When urgent help is needed'],de:['Definition','Symptome und Zeichen','Risikofaktoren','Abklärung und Diagnose','Behandlung und Verlauf','Wann dringend Hilfe nötig ist'],ru:['Определение','Симптомы и признаки','Факторы риска','Обследование и диагностика','Ведение и наблюдение','Когда нужна срочная помощь'],uk:['Визначення','Симптоми та ознаки','Фактори ризику','Обстеження і діагностика','Ведення та спостереження','Коли потрібна невідкладна допомога'],uz:['Ta’rif','Alomatlar','Xavf omillari','Tekshiruv va tashxis','Davolash va kuzatuv','Qachon shoshilinch yordam kerak'],hy:['Սահմանում','Ախտանիշներ և նշաններ','Ռիսկի գործոններ','Գնահատում և ախտորոշում','Վարում և հետևում','Երբ է պետք շտապ օգնություն'],tg:['Таъриф','Нишонаҳо','Омилҳои хавф','Арзёбӣ ва ташхис','Идоракунӣ ва пайгирӣ','Кай ёрии фаврӣ лозим аст'],az:['Tərif','Əlamətlər','Risk amilləri','Qiymətləndirmə və diaqnostika','Müalicə və izləmə','Təcili yardım nə vaxt lazımdır'],am:['ትርጉም','ምልክቶች','የአደጋ ምክንያቶች','ግምገማ እና ምርመራ','አያያዝ እና ክትትል','አስቸኳይ እርዳታ መቼ ያስፈልጋል'],ka:['განმარტება','სიმპტომები და ნიშნები','რისკის ფაქტორები','შეფასება და დიაგნოზი','მართვა და დაკვირვება','როდის არის საჭირო სასწრაფო დახმარება']};
export function virtualArticlesForSpecialty(slug:string,lang:string,count=50):Article[]{
 const s=spec(slug);if(!s)return[];const specialty=sp(lang,slug);const doctor=virtualDoctorsForSpecialty(slug,lang,5)[0];const l=L(lang);
 const sections=(articleSections[lang]||articleSections.en) as string[];
 const educational=()=>sections.map((h:string)=>`## ${h}\n\n${l.articleIntro} ${localizedSpecialty(s,lang)}. ${l.answer}`).join('\n\n');
 return Array.from({length:count},(_,i)=>{const topic=articleTopics[i%articleTopics.length];const title=lang==='ar'?`${topic}: ${s.ar}`:`${topic} — ${localizedSpecialty(s,lang)}`;return {id:`catalog-art-${lang}-${slug}-${i+1}`,specialty_id:specialty.id,doctor_id:doctor.id,title,excerpt:l.articleIntro,body:`# ${title}\n\n${l.articleIntro}\n\n${Array.from({length:3+(i%3)},(_,n)=>educational()).join('\n\n')}\n\n## ${lang==='ar'?'الخلاصة':'Summary'}\n\n${l.articleEnd}`,image_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',reading_time_min:3+(i%10)*2,views:1000+i*250,created_at:new Date(2026,1,1+i).toISOString(),specialty,doctor,content_language:lang,is_ai_generated:true} as Article});
}

export function virtualVideosForSpecialty(slug:string,lang:string,count=300):DoctorVideo[]{
 const s=spec(slug);if(!s)return[];const specialty=sp(lang,slug);const doctor=virtualDoctorsForSpecialty(slug,lang,5)[0];const supported=['ar','ru','en','ka','hy','uz'];if(!supported.includes(lang))return[];
 return Array.from({length:count},(_,i)=>({id:`catalog-vid-${lang}-${slug}-${i+1}`,doctor_id:doctor.id,specialty_id:specialty.id,title:`${L(lang).video}: ${localizedSpecialty(s,lang)} — ${i+1}`,description:L(lang).articleIntro,video_url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',thumbnail_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',duration_seconds:180,views:500+i*100,created_at:new Date(2026,1,5+i).toISOString(),doctor,specialty:specialty}));
}
export function virtualAudioForSpecialty(slug:string,lang:string,count=300):DoctorAudio[]{const s=spec(slug);if(!s)return[];const specialty=sp(lang,slug);const doctor=virtualDoctorsForSpecialty(slug,lang,5)[0];return Array.from({length:count},(_,i)=>({id:`catalog-audio-${lang}-${slug}-${i+1}`,doctor_id:doctor.id,specialty_id:specialty.id,title:`${L(lang).audio}: ${localizedSpecialty(s,lang)} — ${i+1}`,description:L(lang).articleIntro,audio_url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',duration_seconds:300,listens:200+i*30,created_at:new Date(2026,1,10+i).toISOString(),doctor,specialty:specialty}));}
export function virtualLibraryForSpecialty(slug:string,lang:string,count=1000):SpecialtyLibraryItem[]{const s=spec(slug);if(!s)return[];const specialty=sp(lang,slug);return Array.from({length:count},(_,i)=>({id:`catalog-book-${lang}-${slug}-${i+1}`,specialty_id:specialty.id,item_type:'book',title:`${L(lang).book}: ${localizedSpecialty(s,lang)} — ${i+1}`,description:L(lang).articleIntro,url:null,image_url:null,source:'SB1 AI Editorial Library',is_auto_generated:true,created_at:new Date(2026,1,15+i).toISOString(),specialty}));}
export function virtualCoursesForSpecialty(slug:string,lang:string,count=4):Course[]{const s=spec(slug);if(!s)return[];const specialty=sp(lang,slug);const doctor=virtualDoctorsForSpecialty(slug,lang,5)[0];return Array.from({length:count},(_,i)=>({id:`catalog-course-${lang}-${slug}-${i+1}`,specialty_id:specialty.id,doctor_id:doctor.id,title:`${L(lang).course}: ${localizedSpecialty(s,lang)} — ${i+1}`,description:L(lang).articleIntro,image_url:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',price:19+i*10,duration_weeks:4+i,lessons_count:8+i*2,level:i===0?'beginner':i===1?'intermediate':'advanced',enrolled_count:100+i*50,rating:4.7,is_published:true,created_at:new Date(2026,2,1+i).toISOString(),doctor,specialty}));}

const facilityKinds=[['clinic','clinic'],['lab','lab'],['radiology','radiology'],['elderly','elderly'],['pharmacy','pharmacy'],['addiction','addiction'],['rehab','rehab'],['medical-supplies','medical-supplies'],['other-services','other-services'],['property','property']] as const;
const facilityNames:Record<string,Record<string,string>>={
 ar:{clinic:'عيادة',lab:'مختبر تحاليل',radiology:'مركز أشعة',elderly:'دار رعاية المسنين',pharmacy:'صيدلية',addiction:'مركز علاج الإدمان',rehab:'مركز التأهيل والعلاج الطبيعي','medical-supplies':'أدوات وأجهزة طبية','other-services':'خدمات أخرى',property:'أماكن طبية للبيع أو الإيجار'},
 en:{clinic:'Clinic',lab:'Laboratory',radiology:'Radiology Center',elderly:'Elderly Care',pharmacy:'Pharmacy',addiction:'Addiction Treatment',rehab:'Rehabilitation & Physiotherapy','medical-supplies':'Medical Equipment & Supplies','other-services':'Other Medical Services',property:'Medical Places for Sale or Rent'},
 ru:{clinic:'Клиника',lab:'Лаборатория',radiology:'Радиологический центр',elderly:'Уход за пожилыми',pharmacy:'Аптека',addiction:'Лечение зависимостей',rehab:'Реабилитация и физиотерапия','medical-supplies':'Медицинское оборудование','other-services':'Другие медицинские услуги',property:'Медицинские объекты на продажу или аренду'},
 de:{clinic:'Klinik',lab:'Labor',radiology:'Radiologiezentrum',elderly:'Seniorenpflege',pharmacy:'Apotheke',addiction:'Suchtbehandlung',rehab:'Rehabilitation & Physiotherapie','medical-supplies':'Medizinische Geräte','other-services':'Weitere medizinische Dienste',property:'Medizinische Objekte zum Verkauf oder zur Miete'},
 uk:{clinic:'Клініка',lab:'Лабораторія',radiology:'Радіологічний центр',elderly:'Догляд за літніми',pharmacy:'Аптека',addiction:'Лікування залежностей',rehab:'Реабілітація та фізіотерапія','medical-supplies':'Медичне обладнання','other-services':'Інші медичні послуги',property:'Медичні об’єкти на продаж або оренду'},
 uz:{clinic:'Klinika',lab:'Laboratoriya',radiology:'Radiologiya markazi',elderly:'Keksalar parvarishi',pharmacy:'Dorixona',addiction:'Giyohvandlikni davolash',rehab:'Reabilitatsiya va fizioterapiya','medical-supplies':'Tibbiy uskunalar','other-services':'Boshqa tibbiy xizmatlar',property:'Sotish yoki ijaraga tibbiy joylar'},
 hy:{clinic:'Կլինիկա',lab:'Լաբորատորիա',radiology:'Ռադիոլոգիայի կենտրոն',elderly:'Տարեցների խնամք',pharmacy:'Դեղատուն',addiction:'Կախվածությունների բուժում',rehab:'Վերականգնում և ֆիզիոթերապիա','medical-supplies':'Բժշկական սարքավորումներ','other-services':'Այլ բժշկական ծառայություններ',property:'Բժշկական տարածքներ վաճառքի կամ վարձակալության'},
 tg:{clinic:'Клиника',lab:'Озмоишгоҳ',radiology:'Маркази радиология',elderly:'Нигоҳубини пиронсолон',pharmacy:'Дорухона',addiction:'Табобати вобастагӣ',rehab:'Барқарорсозӣ ва физиотерапия','medical-supplies':'Таҷҳизоти тиббӣ','other-services':'Дигар хизматрасониҳои тиббӣ',property:'Объектҳои тиббӣ барои фурӯш ё иҷора'},
 az:{clinic:'Klinika',lab:'Laboratoriya',radiology:'Radiologiya mərkəzi',elderly:'Yaşlılara qayğı',pharmacy:'Aptek',addiction:'Asılılıq müalicəsi',rehab:'Reabilitasiya və fizioterapiya','medical-supplies':'Tibbi avadanlıq','other-services':'Digər tibbi xidmətlər',property:'Satış və ya icarə üçün tibbi obyektlər'},
 am:{clinic:'ክሊኒክ',lab:'ላቦራቶሪ',radiology:'ራዲዮሎጂ ማዕከል',elderly:'የአረጋውያን እንክብካቤ',pharmacy:'ፋርማሲ',addiction:'የሱስ ሕክምና',rehab:'ማገገሚያ እና ፊዚዮቴራፒ','medical-supplies':'የሕክምና መሣሪያዎች','other-services':'ሌሎች የሕክምና አገልግሎቶች',property:'የሕክምና ቦታዎች ለሽያጭ ወይም ኪራይ'},
 ka:{clinic:'კლინიკა',lab:'ლაბორატორია',radiology:'რადიოლოგიის ცენტრი',elderly:'ხანდაზმულთა მოვლა',pharmacy:'აფთიაქი',addiction:'დამოკიდებულების მკურნალობა',rehab:'რეაბილიტაცია და ფიზიოთერაპია','medical-supplies':'სამედიცინო მოწყობილობები','other-services':'სხვა სამედიცინო სერვისები',property:'სამედიცინო ობიექტები გასაყიდად ან გასაქირავებლად'}
};

export function serviceCitiesForCountry(countryKey:string):string[]{const map:Record<string,string[]>={
syria:['دمشق','حلب','حمص','اللاذقية'],saudi:['الرياض','جدة','الدمام','مكة المكرمة'],uae:['دبي','أبوظبي','الشارقة'],egypt:['القاهرة','الإسكندرية','الغردقة','الجيزة'],jordan:['عمّان','إربد','الزرقاء'],lebanon:['بيروت','طرابلس','صيدا'],iraq:['بغداد','البصرة','أربيل'],kuwait:['الكويت','حولي','الفروانية'],libya:['طرابلس','بنغازي','مصراتة'],morocco:['الدار البيضاء','الرباط','مراكش','طنجة'],oman:['مسقط','صلالة','صحار'],qatar:['الدوحة','الريان'],tunisia:['تونس','صفاقس','سوسة'],yemen:['صنعاء','عدن','تعز'],algeria:['الجزائر','وهران','قسنطينة'],bahrain:['المنامة','المحرق','الرفاع'],sudan:['الخرطوم','بورتسودان','أم درمان'],germany:['Berlin','Hamburg','Munich','Frankfurt'],austria:['Wien','Graz','Salzburg'],switzerland:['Zürich','Genf','Basel'],russia:['Москва','Санкт-Петербург','Казань','Новосибирск'],ukraine:['Київ','Львів','Одеса','Харків'],uzbekistan:['Toshkent','Samarqand','Buxoro'],armenia:['Երևան','Գյումրի','Վանաձոր'],georgia:['თბილისი','ბათუმი','ქუთაისი'],usa:['New York','Los Angeles','Chicago','Houston'],uk:['London','Manchester','Birmingham','Liverpool'],canada:['Toronto','Vancouver','Montreal','Calgary']};return map[countryKey]||[countryData[countryKey]?.city||countryKey];}
export function virtualFacilities(lang:string,countryKey?:string,cityFilter?:string,kindFilter?:string):AdditionalFacility[]{
 const choices=countriesForLanguage(lang);
 const key=countryKey&&countryData[countryKey]?countryKey:(choices[0]?.key||'syria');
 const c=countryData[key];
 const countryName=c?c.names[lang]||c.names.en:arabCountryNames[key]||key;
 const cities=serviceCitiesForCountry(key).filter(x=>!cityFilter||x===cityFilter);
 return facilityKinds.flatMap(([kind])=>{
  if(kindFilter&&kindFilter!==kind)return [];
  return cities.flatMap((city,ci)=>Array.from({length:2},(_,i)=>({
   id:`catalog-fac-${lang}-${key}-${city}-${kind}-${i+1}`,
   facility_type:kind,
   name:kind==='other-services'?`${(otherMedicalServices[lang]||otherMedicalServices.en)[(ci*2+i)%8]} — ${city}`:`${facilityNames[lang]?.[kind]||facilityNames.en[kind]} ${countryName} ${i+1}`,
   description:`${L(lang).articleIntro} — ${countryName} · ${city}`,
   address:`${city} · SB1 Health District`,
   city,
   country:countryName,
   phone:null,email:null,logo_url:null,
   services:kind==='other-services'?((otherMedicalServices[lang]||otherMedicalServices.en).join(' · ')):'Appointments · services · prices · schedules',
   gallery_urls:['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1580281658223-9b93f18ae9ae?auto=format&fit=crop&w=1200&q=80'],
   video_url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
   property_mode:kind==='property'?(i%2?'rent':'sale'):null,
   schedule:{sun:'09:00-18:00',mon:'09:00-18:00',tue:'09:00-18:00',wed:'09:00-18:00',thu:'09:00-18:00'},
   rating:4.6+(i/10),
   service_price:kind==='clinic'?25:kind==='lab'?15:kind==='radiology'?40:kind==='pharmacy'?10:kind==='addiction'?60:kind==='rehab'?35:kind==='elderly'?80:kind==='medical-supplies'?20:kind==='other-services'?30:500,
   is_active:true,created_at:new Date(2026,0,1+ci+i).toISOString()
  } as any)));
 });
}
export function languageContentSummary(lang:string){return {language:languageCountry(lang).native,country:languageCountry(lang).country,doctorsPerSpecialty:'5–25 virtual demo profiles',questionsPerSpecialty:'50 demo questions',answersPerQuestion:'5–20 demo answers',articlesPerSpecialty:'50 educational articles',videos:lang==='ar'||lang==='ru'||lang==='en'||lang==='ka'||lang==='hy'||lang==='uz'?'2 demo videos':'not currently seeded',audio:'300 demo audio items',books:'1000 demo library books',courses:'4 demo courses'};}


export function virtualContentById(id:string){
 const m=id.match(/^catalog-(art|vid|audio|book|course)-(.+)-([0-9]+)$/); if(!m)return null;
 const kind=m[1], rest=m[2], n=Number(m[3]); const langs=Object.keys(LANGUAGE_PROFILES);
 for(const lang of langs){const prefix=lang+'-';if(!rest.startsWith(prefix))continue;const slug=rest.slice(prefix.length);if(!comprehensiveSpecialties.some(s=>s.slug===slug))continue;
  if(kind==='art')return virtualArticlesForSpecialty(slug,lang,n).slice(-1)[0]||null;
  if(kind==='vid')return virtualVideosForSpecialty(slug,lang,n).slice(-1)[0]||null;
  if(kind==='audio')return virtualAudioForSpecialty(slug,lang,n).slice(-1)[0]||null;
  if(kind==='book')return virtualLibraryForSpecialty(slug,lang,n).slice(-1)[0]||null;
  if(kind==='course')return virtualCoursesForSpecialty(slug,lang,Math.max(4,n)).find((x:any)=>x.id===id)||null;
 }
 return null;
}

export type FreeSessionMessage = { id:string; sender:'client'|'specialist'; senderName:string; body:string; emoji?:string; createdAt:string };
export type FreeSessionDemo = { id:string; specialtySlug:string; language:string; country:string; city:string; title:string; problem:string; clientNickname:string; clientAvatar:string; specialist:any; messages:FreeSessionMessage[]; status:'open'|'active'|'ended'; views:number; likes:number; comments:number; ageRestricted:boolean; maxMessages:number; acceptedAt?:string; createdAt:string };

const sessionTopics:Record<string,string[]> = {
 ar:['قلق متكرر وصعوبة النوم','نوبات هلع متقطعة','أفكار وسواسية مزعجة','ضغط العمل والإرهاق','مشكلات التواصل داخل الأسرة','الحزن بعد فقد شخص قريب','صعوبة التركيز والدراسة','الخوف من التحدث أمام الآخرين','تنظيم الغضب والانفعال','تحسين العادات والنوم'],
 en:['recurring anxiety and sleep difficulty','intermittent panic symptoms','intrusive obsessive thoughts','work stress and burnout','family communication difficulties','grief after a loss','difficulty concentrating at school','fear of speaking in public','anger and emotional regulation','improving sleep habits'],
 ru:['тревога и трудности со сном','эпизоды паники','навязчивые мысли','стресс и выгорание','семейное общение','переживание утраты','трудности с концентрацией','страх публичных выступлений','управление эмоциями','улучшение сна'],
 de:['wiederkehrende Angst und Schlafprobleme','gelegentliche Panik','aufdringliche Gedanken','Arbeitsstress und Erschöpfung','familiäre Kommunikation','Trauer nach einem Verlust','Konzentrationsprobleme','Angst vor öffentlichen Auftritten','Emotionsregulation','besserer Schlaf'],
 uk:['тривога та труднощі зі сном','панічні епізоди','нав’язливі думки','стрес і вигорання','сімейне спілкування','переживання втрати','труднощі концентрації','страх публічних виступів','керування емоціями','покращення сну'],
 uz:['takroriy xavotir va uyqu qiyinligi','vahima epizodlari','bezovta qiluvchi fikrlar','ish stressi va charchoq','oilaviy muloqot','yo‘qotishdan keyingi qayg‘u','diqqatni jamlash qiyinligi','ommaviy nutqdan qo‘rquv','his-tuyg‘ularni boshqarish','uyquni yaxshilash'],
 hy:['կրկնվող անհանգստություն և քնի դժվարություն','խուճապի դրվագներ','կպչուն մտքեր','աշխատանքային սթրես','ընտանեկան հաղորդակցություն','կորուստից հետո վիշտ','կենտրոնացման դժվարություն','հանրային խոսքի վախ','զգացմունքների կառավարում','քնի բարելավում'],
 ka:['განმეორებითი შფოთვა და ძილის სირთულე','პანიკის ეპიზოდები','აკვიატებული აზრები','სამუშაო სტრესი','ოჯახური კომუნიკაცია','დანაკარგის შემდეგ მწუხარება','კონცენტრაციის სირთულე','საჯარო გამოსვლის შიში','ემოციების მართვა','ძილის გაუმჯობესება']
};
const sessionText=(lang:string)=>({ar:{request:'أرغب في فهم ما يحدث معي وماذا يمكنني أن أفعل بشكل آمن.',reply:'أفهم ما تصفه. سنبدأ بتوضيح الأعراض والوقت الذي تظهر فيه، ثم نحدد خطوات عامة مناسبة ومتى تحتاج إلى تقييم مباشر.',follow:'هل يمكنك وصف أكثر وقت تزداد فيه المشكلة؟'},en:{request:'I would like to understand what is happening and what I can do safely.',reply:'I understand. We can clarify the symptoms and when they appear, then discuss general safe steps and when an in-person assessment is appropriate.',follow:'Can you describe when the problem becomes strongest?'},ru:{request:'Я хочу понять, что со мной происходит и что можно сделать безопасно.',reply:'Понимаю. Сначала уточним симптомы и время их появления, затем обсудим общие безопасные шаги и когда нужна очная оценка.',follow:'Можете описать, когда проблема усиливается?'},de:{request:'Ich möchte verstehen, was passiert und was ich sicher tun kann.',reply:'Ich verstehe. Wir klären die Beschwerden und ihren zeitlichen Verlauf und besprechen dann allgemeine sichere Schritte und wann eine persönliche Abklärung sinnvoll ist.',follow:'Wann wird das Problem bei Ihnen stärker?'},uk:{request:'Я хочу зрозуміти, що зі мною відбувається і що можна робити безпечно.',reply:'Розумію. Уточнимо симптоми та коли вони виникають, а потім обговоримо загальні безпечні кроки й коли потрібна очна оцінка.',follow:'Коли проблема посилюється найбільше?'},uz:{request:'Men nima bo‘layotganini va xavfsiz nima qilish mumkinligini tushunmoqchiman.',reply:'Tushunaman. Alomatlar va ularning vaqtini aniqlab, umumiy xavfsiz qadamlar hamda qachon ko‘rik kerakligini muhokama qilamiz.',follow:'Muammo qachon kuchayishini tasvirlab bera olasizmi?'},hy:{request:'Ես ուզում եմ հասկանալ, թե ինչ է կատարվում և ինչ կարող եմ անել անվտանգ։',reply:'Հասկանում եմ։ Կճշտենք ախտանիշները և դրանց առաջացման ժամանակը, ապա կքննարկենք ընդհանուր անվտանգ քայլերը և երբ է անհրաժեշտ մասնագիտական գնահատում։',follow:'Ե՞րբ է խնդիրը առավել ուժեղանում։'},ka:{request:'მინდა გავიგო რა ხდება და რა შემიძლია უსაფრთხოდ გავაკეთო.',reply:'გესმით. დავაზუსტოთ სიმპტომები და მათი დრო, შემდეგ განვიხილოთ უსაფრთხო ზოგადი ნაბიჯები და როდის არის საჭირო პირადი შეფასება.',follow:'შეგიძლიათ აღწეროთ, როდის ძლიერდება პრობლემა?'}}[lang]||{request:'I want to understand what is happening and what I can do safely.',reply:'We will clarify the symptoms, discuss general safe steps and when specialist assessment is appropriate.',follow:'When does the problem become stronger?'});

export function freeSessionsForSpecialty(slug:string,lang:string,count=25):FreeSessionDemo[]{
 const s=spec(slug); if(!s)return [];
 const profile=languageCountry(lang); const names=namesFor(lang); const topics=sessionTopics[lang]||sessionTopics.en; const tx=sessionText(lang);
 return Array.from({length:25},(_,i)=>{
   const topic=topics[i%topics.length]; const psych=['clinical-psychology','psychiatry','neuropsychology','couples-therapy','sexual-health'].includes(slug);
   const specialistName=psych&&i%7===0?names[0]:names[(i+1)%names.length];
   const specialist=virtualDoctorsForSpecialty(slug,lang,25)[i%25];
   const finalDoctor={...specialist,name:specialistName,photo_url:i%7===0?'/jamal-james.jpg':specialist.photo_url};
   const clientLines:any={ar:['أشعر أن المشكلة تؤثر على يومي أكثر من السابق.','ألاحظ أنها تظهر في مواقف محددة، خاصة عندما أكون متعباً.','حاولت تجاهلها لكنها تعود وتشتت تركيزي.','لا أعرف هل ما أشعر به طبيعي أم يحتاج تقييماً.','أحياناً أستطيع التحكم بها وأحياناً تصبح أصعب.','بدأت ألاحظ تغيراً في نومي وتركيزي بسببها.','هل توجد خطوات آمنة يمكنني تجربتها الآن؟','هل يفيد أن أسجل متى تبدأ الأعراض وما الذي يسبقها؟','أريد أن أعرف متى يكون من الأفضل حجز تقييم متخصص.','سأتابع هذه النقاط وأعود بالمعلومات التي طلبتها.'],en:['It is affecting my day more than before.','I notice it in specific situations, especially when I am tired.','I tried to ignore it, but it keeps returning and affects my focus.','I am not sure whether this is expected or needs assessment.','Sometimes I can manage it and sometimes it becomes harder.','I have noticed changes in my sleep and concentration.','Are there safe steps I can try now?','Would it help to record when symptoms start and what happens before them?','When would you recommend a specialist assessment?','I will track these points and come back with the information.'],ru:['Это стало сильнее влиять на мой день.','Я замечаю это в определённых ситуациях, особенно когда устаю.','Я пытался не обращать внимания, но это снова возвращается.','Не понимаю, нужно ли мне дополнительное обследование.','Иногда мне удаётся это контролировать, а иногда становится сложнее.','Я заметил изменения сна и концентрации.','Есть ли безопасные шаги, которые я могу сделать сейчас?','Стоит ли записывать время появления симптомов и обстоятельства?','Когда лучше обратиться к специалисту лично?','Я последую этим рекомендациям и вернусь с информацией.']};
const specialistLines:any={ar:['سنراجع الأعراض ومدتها والظروف التي تظهر فيها قبل الحكم عليها.','ما ذكرته مهم، خصوصاً ارتباط الأعراض بالتعب أو الضغط.','محاولة التجاهل وحدها لا تعطينا صورة كافية عن السبب.','وجود الأعراض لا يعني تشخيصاً محدداً، ونحتاج إلى سياق أكثر.','قد تتغير شدة الأعراض من يوم لآخر، وهذا يستحق المتابعة.','سجل النوم والتركيز والتوقيت سيساعد في تكوين صورة أوضح.','ابدأ بخطوات بسيطة وآمنة ولا توقف دواءً موصوفاً دون طبيب.','نعم، سجل الوقت والموقف وشدة العرض وما الذي يساعد على تخفيفه.','إذا استمرت الأعراض أو أثرت بوضوح على حياتك فالتقييم المتخصص مناسب.','عندما تعود، أحضر الملاحظات وسنراجعها خطوة بخطوة.'],en:['We should review the symptoms, duration and situations before drawing conclusions.','That detail matters, especially the link with fatigue or stress.','Ignoring symptoms alone does not tell us their cause.','Symptoms do not by themselves establish a diagnosis; more context is needed.','Intensity can change from day to day, so tracking is useful.','Tracking sleep, focus and timing can give us a clearer picture.','Start with simple safe steps and do not stop prescribed medicine without your clinician.','Yes, record the time, situation, intensity and what helps.','If symptoms persist or clearly affect daily life, specialist assessment is appropriate.','Bring your notes next time and we can review them step by step.'],ru:['Нужно уточнить симптомы, их длительность и обстоятельства, прежде чем делать выводы.','Эта деталь важна, особенно связь с усталостью или стрессом.','Само по себе игнорирование симптомов не объясняет их причину.','Симптомы сами по себе не являются диагнозом; нужен дополнительный контекст.','Интенсивность может меняться изо дня в день, поэтому полезно наблюдение.','Записи о сне, концентрации и времени появления помогут увидеть картину.','Начните с безопасных простых шагов и не отменяйте назначенные лекарства без врача.','Да, записывайте время, ситуацию, интенсивность и то, что помогает.','Если симптомы сохраняются или заметно мешают жизни, стоит пройти очную оценку.','Принесите записи при следующем обращении, и мы разберём их по шагам.']};
const cl=clientLines[lang]||clientLines.en; const sl=specialistLines[lang]||specialistLines.en; const messages:FreeSessionMessage[]=[]; for(let m=0;m<20;m++){const sender=m%2===0?'client':'specialist';const n=Math.floor(m/2);messages.push({id:'fs-'+lang+'-'+slug+'-'+(i+1)+'-m'+(m+1),sender,senderName:sender==='client'?'مستخدم-'+(i+11):specialistName,body:sender==='client'?(n===0?tx.request:n===1?tx.follow:cl[n-2]):(n===0?tx.reply:sl[n-1]),emoji:m===3?'🩺':m===9?'🧠':m===15?'📋':undefined,createdAt:new Date(Date.now()-(20-m)*3600000).toISOString()});}
   return {id:'free-session-'+lang+'-'+slug+'-'+(i+1),specialtySlug:slug,language:lang,country:profile.country,city:profile.city,title:lang==='ar'?'جلسة مجانية: '+topic:lang==='ru'?'Бесплатная сессия: '+topic:lang==='de'?'Kostenlose Sitzung: '+topic:'Free session: '+topic,problem:topic,clientNickname:'مستخدم-'+(i+11),clientAvatar:'https://i.pravatar.cc/150?img='+((i%50)+1),specialist:finalDoctor,messages,status:i%4===0?'open':'active',views:1200+i*137,likes:240+i*17,comments:28+i*4,ageRestricted:true,maxMessages:20,acceptedAt:i%4===0?undefined:new Date(Date.now()-(i+1)*86400000).toISOString(),createdAt:new Date(Date.now()-(i+2)*86400000).toISOString()};
 });
}
export function allFreeSessions(lang:string){return comprehensiveSpecialties.flatMap(s=>freeSessionsForSpecialty(s.slug,lang,25));}

export function citiesForCountry(countryKey:string,lang:string='ar'){const aliases:Record<string,string>={SA:'saudi',AE:'uae',EG:'egypt',IQ:'iraq',JO:'jordan',KW:'kuwait',LB:'lebanon',LY:'libya',MA:'morocco',OM:'oman',PS:'palestine',QA:'qatar',SY:'syria',TN:'tunisia',YE:'yemen',DZ:'algeria',BH:'bahrain',MR:'mauritania',KM:'comoros',DJ:'djibouti',SD:'sudan',SO:'somalia',US:'usa',DE:'germany',RU:'russia',UZ:'uzbekistan',AM:'armenia',TJ:'tajikistan',UA:'ukraine',AZ:'azerbaijan',GE:'georgia',ET:'ethiopia'};const key=aliases[countryKey]||countryKey;const base=countryData[key];const fallback=arabCountryCities[countryKey];const city=base?.city||fallback||'';return city?[{key:city,name:city}]:[];}
export function allArabicCountries(){return ARAB_COUNTRIES.map(c=>({key:c.code,name:arabCountryNames[c.code]||c.code,city:arabCountryCities[c.code]||''}));}
