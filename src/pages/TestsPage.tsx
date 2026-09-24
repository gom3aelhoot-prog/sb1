import { useState, useEffect } from 'react';
import { Calculator, Heart, Brain, Eye, Activity, Baby, FlaskConical, Star, Save, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type MedicalTest } from '@/lib/supabase';

const testIcons: Record<string, typeof Calculator> = {
  bmi: Calculator,
  calories: Activity,
  ideal_weight: Star,
  pregnancy: Baby,
  fertility: Baby,
  prediabetes: FlaskConical,
  asthma: Heart,
  vision: Eye,
  depression: Brain,
  anxiety: Brain,
  ocd: Brain,
  ocd_screening: Brain,
};

const categories = [
  { key: 'all', labelKey: 'tests.all_categories' },
  { key: 'general', labelKey: 'tests.cat_general' },
  { key: 'women', labelKey: 'tests.cat_women' },
  { key: 'chronic', labelKey: 'tests.cat_chronic' },
  { key: 'mental', labelKey: 'tests.cat_mental' },
];

type Question = { id: string; text: string; text_en: string; options: { value: number; label: string; label_en: string }[] };

const prediabetesQuestions: Question[] = [
  { id: 'age', text: 'كم عمرك؟', text_en: 'How old are you?', options: [
    { value: 0, label: '18-39', label_en: '18-39' }, { value: 1, label: '40-49', label_en: '40-49' },
    { value: 2, label: '50-59', label_en: '50-59' }, { value: 3, label: '60+', label_en: '60+' },
  ]},
  { id: 'gender', text: 'هل أنت ذكر؟', text_en: 'Are you male?', options: [
    { value: 0, label: 'لا', label_en: 'No' }, { value: 1, label: 'نعم', label_en: 'Yes' },
  ]},
  { id: 'family', text: 'هل لديك تاريخ عائلي للسكري؟', text_en: 'Family history of diabetes?', options: [
    { value: 0, label: 'لا', label_en: 'No' }, { value: 1, label: 'نعم', label_en: 'Yes' },
  ]},
  { id: 'bp', text: 'هل لديك ارتفاع ضغط الدم؟', text_en: 'High blood pressure?', options: [
    { value: 0, label: 'لا', label_en: 'No' }, { value: 1, label: 'نعم', label_en: 'Yes' },
  ]},
  { id: 'active', text: 'هل تمارس الرياضة بانتظام؟', text_en: 'Physically active?', options: [
    { value: 0, label: 'نعم', label_en: 'Yes' }, { value: 1, label: 'لا', label_en: 'No' },
  ]},
  { id: 'weight', text: 'ما هو وزنك؟', text_en: 'Weight category?', options: [
    { value: 0, label: 'طبيعي', label_en: 'Normal' }, { value: 2, label: 'زيادة', label_en: 'Overweight' }, { value: 3, label: 'سمنة', label_en: 'Obese' },
  ]},
];

const asthmaQuestions: Question[] = [
  { id: 'q1', text: 'في الأسابيع الأربعة الماضية، كم مرة كانت أعراض الربز تمنعك من النوم؟', text_en: 'In the past 4 weeks, how often did asthma wake you at night?', options: [
    { value: 0, label: 'أبداً', label_en: 'Never' }, { value: 1, label: '1-2', label_en: '1-2x' }, { value: 2, label: '3-4', label_en: '3-4x' }, { value: 3, label: '5+', label_en: '5+' },
  ]},
  { id: 'q2', text: 'كم مرة استخدمت البخاخ؟', text_en: 'How often did you use your inhaler?', options: [
    { value: 0, label: '0-1', label_en: '0-1x' }, { value: 1, label: '2-3', label_en: '2-3x' }, { value: 2, label: '4-5', label_en: '4-5x' }, { value: 3, label: '6+', label_en: '6+' },
  ]},
  { id: 'q3', text: 'هل أثر الربز على أنشطتك اليومية؟', text_en: 'Did asthma limit your daily activities?', options: [
    { value: 0, label: 'أبداً', label_en: 'Never' }, { value: 1, label: 'قليلاً', label_en: 'Slightly' }, { value: 2, label: 'متوسط', label_en: 'Moderately' }, { value: 3, label: 'كثيراً', label_en: 'A lot' },
  ]},
];

const depressionQuestions: Question[] = [
  { id: 'q1', text: 'هل شعرت بفقدان الاهتمام أو المتعة؟', text_en: 'Little interest or pleasure in doing things?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
  { id: 'q2', text: 'هل شعرت بالاكتئاب أو اليأس؟', text_en: 'Feeling down or hopeless?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
  { id: 'q3', text: 'هل واجهت مشاكل في النوم؟', text_en: 'Trouble sleeping or sleeping too much?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
  { id: 'q4', text: 'هل شعرت بالإرهاق أو قلة طاقة؟', text_en: 'Feeling tired or low energy?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
  { id: 'q5', text: 'هل واجهت صعوبة في التركيز؟', text_en: 'Trouble concentrating?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
];

const anxietyQuestions: Question[] = [
  { id: 'q1', text: 'هل شعرت بالتوتر أو القلق؟', text_en: 'Feeling nervous or anxious?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
  { id: 'q2', text: 'هل كنت غير قادر على إيقاف القلق؟', text_en: 'Unable to stop worrying?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
  { id: 'q3', text: 'هل شعرت بالقلق بشأن أشياء مختلفة؟', text_en: 'Worrying about different things?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
  { id: 'q4', text: 'هل واجهت صعوبة في الاسترخاء؟', text_en: 'Trouble relaxing?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
  { id: 'q5', text: 'هل شعرت بالانزعاج بسهولة؟', text_en: 'Easily annoyed or irritable?', options: [
    { value: 0, label: 'إطلاقاً', label_en: 'Not at all' }, { value: 1, label: 'عدة أيام', label_en: 'Several days' }, { value: 2, label: 'أكثر من نصف الأيام', label_en: 'More than half' }, { value: 3, label: 'تقريباً يومياً', label_en: 'Nearly every day' },
  ]},
];

const ocdQuestions: Question[] = [
 {id:'ocd1',text:'كم مرة تشعر بأفكار متكررة مزعجة لا تستطيع إيقافها بسهولة؟',text_en:'How often do intrusive repetitive thoughts bother you?',options:[{value:0,label:'أبداً',label_en:'Never'},{value:1,label:'أحياناً',label_en:'Sometimes'},{value:2,label:'كثيراً',label_en:'Often'},{value:3,label:'شبه يومي',label_en:'Nearly daily'}]},
 {id:'ocd2',text:'هل تشعر بحاجة متكررة للقيام بسلوك أو طقس لتخفيف القلق؟',text_en:'Do you feel driven to perform a repeated behavior to reduce anxiety?',options:[{value:0,label:'أبداً',label_en:'Never'},{value:1,label:'أحياناً',label_en:'Sometimes'},{value:2,label:'كثيراً',label_en:'Often'},{value:3,label:'شبه يومي',label_en:'Nearly daily'}]},
 {id:'ocd3',text:'هل تستغرق هذه الأفكار أو السلوكيات وقتاً يؤثر على يومك؟',text_en:'Do these thoughts or behaviors take time and affect your day?',options:[{value:0,label:'لا',label_en:'No'},{value:1,label:'قليلاً',label_en:'A little'},{value:2,label:'بشكل واضح',label_en:'Clearly'},{value:3,label:'بشكل كبير',label_en:'A lot'}]},
 {id:'ocd4',text:'هل تتجنب أماكن أو مواقف خوفاً من أفكار أو مخاوف متكررة؟',text_en:'Do you avoid situations because of recurring fears or thoughts?',options:[{value:0,label:'لا',label_en:'No'},{value:1,label:'نادراً',label_en:'Rarely'},{value:2,label:'أحياناً',label_en:'Sometimes'},{value:3,label:'كثيراً',label_en:'Often'}]},
 {id:'ocd5',text:'هل يصعب عليك مقاومة الطقوس أو التحقق المتكرر؟',text_en:'Is it difficult to resist rituals or repeated checking?',options:[{value:0,label:'لا',label_en:'No'},{value:1,label:'قليلاً',label_en:'A little'},{value:2,label:'نعم',label_en:'Yes'},{value:3,label:'بشكل شديد',label_en:'Severely'}]},
];
const demoMedicalTests: MedicalTest[] = [
 {id:'demo-ocd',test_type:'ocd',title:'اختبار أعراض الوسواس القهري — فحص أولي',title_en:'OCD Symptom Screening',description:'فحص أولي تعليمي للأعراض وليس تشخيصاً.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()},
 {id:'demo-ocd2',test_type:'ocd_screening',title:'اختبار الوسواس والتكرار — نسخة ثانية',title_en:'OCD Repetition Screening',description:'اختبار إضافي لاستكشاف الأعراض العامة.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()},
 ...Array.from({length:4},(_,i)=>({id:`demo-ocd-${i+3}`,test_type:'ocd',title:`اختبار الوسواس القهري — نموذج ${i+3}`,title_en:`OCD Screening — Form ${i+3}`,description:'فحص أولي تعليمي إضافي لأعراض الوسواس.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()} as MedicalTest)),
 {id:'demo-depression',test_type:'depression',title:'فحص أعراض الاكتئاب',title_en:'Depression Symptom Screening',description:'فحص أولي للأعراض النفسية.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()},
 {id:'demo-anxiety',test_type:'anxiety',title:'فحص أعراض القلق',title_en:'Anxiety Symptom Screening',description:'فحص أولي لأعراض القلق.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()},
];
const generatedMentalTests: MedicalTest[] = [
  ...Array.from({length:8},(_,i)=>({id:'sb1-ocd-'+(i+1),test_type:'ocd',title:'فحص الوسواس والتكرار — نموذج '+(i+1),title_en:'OCD & Repetitive Thoughts Screen — Form '+(i+1),description:'فحص تعليمي أولي للأفكار المتكررة والسلوكيات القهرية.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()} as MedicalTest)),
  ...Array.from({length:8},(_,i)=>({id:'sb1-anxiety-'+(i+1),test_type:'anxiety',title:'فحص القلق والتوتر — نموذج '+(i+1),title_en:'Anxiety & Worry Screen — Form '+(i+1),description:'فحص تعليمي أولي لأعراض القلق والتوتر.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()} as MedicalTest)),
  ...Array.from({length:8},(_,i)=>({id:'sb1-depression-'+(i+1),test_type:'depression',title:'فحص المزاج والاكتئاب — نموذج '+(i+1),title_en:'Mood & Depression Screen — Form '+(i+1),description:'فحص تعليمي أولي للمزاج وفقدان الاهتمام والطاقة.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()} as MedicalTest)),
  ...Array.from({length:6},(_,i)=>({id:'sb1-ptsd-'+(i+1),test_type:'ptsd',title:'فحص أعراض ما بعد الصدمة — نموذج '+(i+1),title_en:'Trauma & PTSD Symptom Screen — Form '+(i+1),description:'فحص تعليمي أولي للأعراض المرتبطة بالصدمة.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()} as MedicalTest)),
  ...Array.from({length:6},(_,i)=>({id:'sb1-panic-'+(i+1),test_type:'panic',title:'فحص نوبات الهلع — نموذج '+(i+1),title_en:'Panic Symptom Screen — Form '+(i+1),description:'فحص تعليمي أولي لأعراض نوبات الهلع.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()} as MedicalTest)),
  ...Array.from({length:6},(_,i)=>({id:'sb1-sleep-'+(i+1),test_type:'sleep',title:'فحص النوم والأرق — نموذج '+(i+1),title_en:'Sleep & Insomnia Screen — Form '+(i+1),description:'فحص تعليمي أولي لجودة النوم والأرق.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()} as MedicalTest)),
  ...Array.from({length:6},(_,i)=>({id:'sb1-social-'+(i+1),test_type:'social_anxiety',title:'فحص القلق الاجتماعي — نموذج '+(i+1),title_en:'Social Anxiety Screen — Form '+(i+1),description:'فحص تعليمي أولي للخوف والقلق في المواقف الاجتماعية.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()} as MedicalTest)),
  ...Array.from({length:6},(_,i)=>({id:'sb1-adhd-'+(i+1),test_type:'adhd',title:'فحص الانتباه وفرط الحركة — نموذج '+(i+1),title_en:'Attention & Hyperactivity Screen — Form '+(i+1),description:'فحص تعليمي أولي لصعوبات الانتباه والتنظيم.',category:'mental',questions:null,created_by:null,is_active:true,created_at:new Date().toISOString()} as MedicalTest)),
];

const extraQuestionSets: Record<string,Question[]> = {
 ptsd:Array.from({length:8},(_,i)=>({id:'ptsd-'+i,text:['هل تتكرر لديك ذكريات أو أحلام مزعجة بعد حدث شديد التوتر؟','هل تتجنب أشياء تذكرك بالحدث؟','هل تشعر بأنك في حالة تأهب أو فزع بسهولة؟','هل تشعر بالانفصال أو الخدر العاطفي؟','هل يؤثر ما حدث على نومك؟','هل تتجنب الحديث عن الحدث أو التفكير فيه؟','هل أثرت الأعراض على العمل أو الدراسة؟','هل تشعر بالذنب أو لوم الذات بسبب ما حدث؟'][i],text_en:['Do unwanted memories or dreams about a stressful event recur?','Do you avoid reminders of the event?','Do you feel constantly on guard or easily startled?','Do you feel detached or emotionally numb?','Has the event affected your sleep?','Do you avoid talking or thinking about the event?','Have symptoms affected work or study?','Do you feel guilt or self-blame about what happened?'][i],options:[{value:0,label:'أبداً',label_en:'Not at all'},{value:1,label:'أحياناً',label_en:'Sometimes'},{value:2,label:'كثيراً',label_en:'Often'},{value:3,label:'شديداً',label_en:'Very much'}]})),
 panic:Array.from({length:8},(_,i)=>({id:'panic-'+i,text:['هل تأتيك نوبات مفاجئة من خوف شديد أو انزعاج؟','هل تشعر بخفقان أو تسارع ضربات القلب أثناء النوبة؟','هل تشعر بضيق نفس أو دوخة أثناء النوبة؟','هل تخاف من حدوث نوبة أخرى؟','هل بدأت تتجنب أماكن خوفاً من النوبة؟','هل تحدث النوبات دون سبب واضح؟','هل تؤثر النوبات على العمل أو الدراسة؟','هل تستمر في مراقبة جسمك بحثاً عن علامات النوبة؟'][i],text_en:['Do you have sudden episodes of intense fear or discomfort?','Do you notice a racing or pounding heart during episodes?','Do you feel short of breath or dizzy during an episode?','Do you worry about having another episode?','Do you avoid places because of fear of an episode?','Do episodes occur without an obvious trigger?','Do episodes affect work or study?','Do you monitor your body for signs of another attack?'][i],options:[{value:0,label:'أبداً',label_en:'Never'},{value:1,label:'أحياناً',label_en:'Sometimes'},{value:2,label:'كثيراً',label_en:'Often'},{value:3,label:'شديداً',label_en:'Very much'}]})),
 sleep:Array.from({length:8},(_,i)=>({id:'sleep-'+i,text:['هل تجد صعوبة في بدء النوم؟','هل تستيقظ عدة مرات أثناء الليل؟','هل تستيقظ أبكر مما تريد ولا تستطيع العودة للنوم؟','هل تشعر بالتعب خلال النهار؟','هل يؤثر ضعف النوم على التركيز؟','هل تقلق كثيراً بشأن النوم؟','هل تستخدم الهاتف أو المنبهات قبل النوم مباشرة؟','هل استمرت مشكلة النوم لأسابيع؟'][i],text_en:['Do you have trouble falling asleep?','Do you wake several times during the night?','Do you wake earlier than intended and cannot return to sleep?','Do you feel tired during the day?','Does poor sleep affect concentration?','Do you worry a lot about sleep?','Do you use screens or stimulants immediately before sleep?','Has the sleep problem lasted for weeks?'][i],options:[{value:0,label:'أبداً',label_en:'Never'},{value:1,label:'أحياناً',label_en:'Sometimes'},{value:2,label:'كثيراً',label_en:'Often'},{value:3,label:'شبه يومي',label_en:'Nearly daily'}]})),
 social_anxiety:Array.from({length:8},(_,i)=>({id:'social-'+i,text:['هل تشعر بخوف واضح من تقييم الآخرين لك؟','هل تتجنب الحديث أمام مجموعة؟','هل تشعر بقلق شديد عند مقابلة أشخاص جدد؟','هل تتجنب المناسبات الاجتماعية بسبب القلق؟','هل تفكر طويلاً في أخطاء اجتماعية صغيرة؟','هل تظهر أعراض جسدية مثل التعرق أو الرجفة في المواقف الاجتماعية؟','هل يؤثر هذا القلق على الدراسة أو العمل؟','هل ترغب في المشاركة الاجتماعية لكن القلق يمنعك؟'][i],text_en:['Do you strongly fear being judged by others?','Do you avoid speaking in groups?','Do you feel intense anxiety meeting new people?','Do you avoid social events because of anxiety?','Do you replay small social mistakes for a long time?','Do you have sweating or trembling in social situations?','Does this anxiety affect work or study?','Do you want social participation but anxiety stops you?'][i],options:[{value:0,label:'أبداً',label_en:'Never'},{value:1,label:'أحياناً',label_en:'Sometimes'},{value:2,label:'كثيراً',label_en:'Often'},{value:3,label:'شديداً',label_en:'Very much'}]})),
 adhd:Array.from({length:8},(_,i)=>({id:'adhd-'+i,text:['هل تجد صعوبة متكررة في إنهاء المهام التي بدأت بها؟','هل تتشتت بسهولة أثناء العمل أو الدراسة؟','هل تنسى المواعيد أو الأشياء الضرورية؟','هل تؤجل المهام التي تحتاج تركيزاً طويلاً؟','هل تجد صعوبة في تنظيم الوقت والأولويات؟','هل تتحرك أو تتململ عندما يفترض أن تبقى هادئاً؟','هل تتحدث أو تتصرف بسرعة قبل التفكير أحياناً؟','هل بدأت هذه الصعوبات منذ فترة طويلة وتظهر في أكثر من بيئة؟'][i],text_en:['Do you often struggle to finish tasks you started?','Are you easily distracted at work or study?','Do you forget appointments or necessary items?','Do you delay tasks that require sustained attention?','Do you struggle to organize time and priorities?','Do you fidget when expected to stay still?','Do you sometimes act or speak before thinking?','Have these difficulties been long-standing and present in more than one setting?'][i],options:[{value:0,label:'أبداً',label_en:'Never'},{value:1,label:'أحياناً',label_en:'Sometimes'},{value:2,label:'كثيراً',label_en:'Often'},{value:3,label:'شديداً',label_en:'Very often'}]}))
};
const officialTestResources=[
 {name:'PHQ-9 — فحص الاكتئاب',name_en:'PHQ-9 — Depression screening',url:'https://www.nih.gov/node/19946',source:'NIH'},
 {name:'PC-PTSD-5 — فحص ما بعد الصدمة',name_en:'PC-PTSD-5 — PTSD screen',url:'https://www.ptsd.va.gov/professional/assessment/screens/pc-ptsd.asp',source:'VA National Center for PTSD'},
 {name:'PCL-5 — قائمة أعراض ما بعد الصدمة',name_en:'PCL-5 — PTSD Checklist',url:'https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp',source:'VA National Center for PTSD'},
 {name:'ASQ — فحص خطر الانتحار',name_en:'ASQ — Suicide risk screen',url:'https://www.nimh.nih.gov/research/research-conducted-at-nimh/asq-toolkit-materials/adults-asq-toolkit',source:'NIMH'}
];
const questionnaireMap: Record<string, Question[]> = {
  prediabetes: prediabetesQuestions,
  asthma: asthmaQuestions,
  depression: depressionQuestions,
  anxiety: anxietyQuestions,
  ocd: ocdQuestions,
  ocd_screening: ocdQuestions,
  ...Object.fromEntries(Object.keys(extraQuestionSets).map(k=>[k,extraQuestionSets[k]])),
};

export default function TestsPage() {
  const { t, lang } = useI18n();
  const [tests, setTests] = useState<MedicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTest, setActiveTest] = useState<MedicalTest | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [qIndex, setQIndex] = useState(0);
  const [qAnswers, setQAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('medical_tests').select('*').eq('is_active', true).order('title');
      setTests([...(data||[]),...demoMedicalTests,...generatedMentalTests]);
      setLoading(false);
    })();
  }, []);

  const getTestTitle=(test:MedicalTest)=>{const x:any=test;return x.translations?.[lang]?.title || (lang==='en'&&test.title_en?test.title_en:test.title)};
  const getTestDescription=(test:MedicalTest)=>{const x:any=test;return x.translations?.[lang]?.description || test.description};
  const filteredTests = tests.filter((tst) => (activeCategory === 'all' || tst.category === activeCategory) && (!search || tst.title.toLowerCase().includes(search.toLowerCase()) || (tst.title_en||'').toLowerCase().includes(search.toLowerCase())));

  const tr = (ar: string, en: string) => lang === 'en' ? en : ar;

  const calculateBMI = () => {
    const w = parseFloat(formValues.weight);
    const h = parseFloat(formValues.height) / 100;
    if (!w || !h) return;
    const bmi = w / (h * h);
    let category = '';
    if (bmi < 18.5) category = tr('نقص في الوزن', 'Underweight');
    else if (bmi < 25) category = tr('وزن طبيعي', 'Normal weight');
    else if (bmi < 30) category = tr('زيادة في الوزن', 'Overweight');
    else category = tr('سمنة', 'Obese');
    setResult(`${t('tests.your_bmi')}: ${bmi.toFixed(1)} - ${category}`);
  };

  const calculateCalories = () => {
    const w = parseFloat(formValues.weight);
    const h = parseFloat(formValues.height);
    const a = parseFloat(formValues.age);
    const gender = formValues.gender;
    const activity = parseFloat(formValues.activity || '1.55');
    if (!w || !h || !a || !gender) return;
    const bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    const calories = Math.round(bmr * activity);
    setResult(`${t('tests.your_calories')}: ${calories} kcal`);
  };

  const calculateIdealWeight = () => {
    const h = parseFloat(formValues.height);
    const gender = formValues.gender;
    if (!h || !gender) return;
    const ideal = gender === 'male' ? (h - 100) * 0.9 : (h - 100) * 0.85;
    setResult(`${t('tests.your_ideal_weight')}: ${ideal.toFixed(1)} kg`);
  };

  const calculatePregnancy = () => {
    const lmp = formValues.lmp;
    if (!lmp) return;
    const due = new Date(lmp);
    due.setDate(due.getDate() + 280);
    const fmt = due.toLocaleDateString(lang === 'ar' ? 'ar' : 'en');
    const weeks = Math.floor((Date.now() - new Date(lmp).getTime()) / (1000 * 60 * 60 * 24 * 7));
    setResult(`${tr('موعد الولادة المتوقع', 'Estimated due date')}: ${fmt} (${weeks} ${tr('أسبوع', 'weeks')})`);
  };

  const calculateFertility = () => {
    const lmp = formValues.lmp;
    const cycle = parseInt(formValues.cycle || '28');
    if (!lmp) return;
    const start = new Date(lmp);
    const ovulation = new Date(start);
    ovulation.setDate(ovulation.getDate() + cycle - 14);
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(fertileStart.getDate() - 3);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    const fmt = (d: Date) => d.toLocaleDateString(lang === 'ar' ? 'ar' : 'en');
    setResult(`${tr('يوم التبويض', 'Ovulation day')}: ${fmt(ovulation)}\n${tr('فترة الخصوبة', 'Fertile window')}: ${fmt(fertileStart)} - ${fmt(fertileEnd)}`);
  };

  const calculateQuestionnaire = () => {
    if (!activeTest) return;
    const questions = questionnaireMap[activeTest.test_type];
    if (!questions) return;
    const total = questions.reduce((sum, q) => sum + (qAnswers[q.id] || 0), 0);
    let msg = '';
    if (activeTest.test_type === 'prediabetes') {
      if (total >= 5) msg = tr('مستوى عالي - يُنصح بمراجعة الطبيب', 'High risk - please consult a doctor');
      else if (total >= 3) msg = tr('مستوى متوسط - يُنصح بالفحص', 'Moderate risk - screening recommended');
      else msg = tr('مستوى منخفض', 'Low risk');
    } else if (activeTest.test_type === 'asthma') {
      if (total <= 2) msg = tr('الربو تحت السيطرة', 'Asthma is well controlled');
      else if (total <= 5) msg = tr('سيطرة جزئية', 'Partially controlled');
      else msg = tr('غير محكم السيطرة - راجع الطبيب', 'Uncontrolled - see a doctor');
    } else if (activeTest.test_type === 'depression') {
      if (total >= 10) msg = tr('أعراض متوسطة-شديدة - راجع الطبيب', 'Moderate-severe symptoms - see a doctor');
      else if (total >= 5) msg = tr('أعراض خفيفة-متوسطة', 'Mild-moderate symptoms');
      else msg = tr('أعراض طبيعية', 'Minimal symptoms');
    } else if (activeTest.test_type === 'ocd' || activeTest.test_type === 'ocd_screening') { if (total >= 10) msg = tr('أعراض تستحق تقييماً متخصصاً قريباً','Symptoms warrant specialist assessment'); else if (total >= 5) msg = tr('أعراض ملحوظة — يفضل مناقشتها مع مختص','Noticeable symptoms — consider discussing with a specialist'); else msg = tr('أعراض قليلة في هذا الفحص','Few symptoms on this screen');
    } else if (activeTest.test_type === 'anxiety') {
      if (total >= 10) msg = tr('قلق متوسط-شديد - راجع الطبيب', 'Moderate-severe anxiety - see a doctor');
      else if (total >= 5) msg = tr('قلق خفيف-متوسط', 'Mild-moderate anxiety');
      else msg = tr('أعراض قليلة في هذا الفحص', 'Few symptoms on this screen');
    } else { msg = tr('نتيجة فحص أولي — ناقش النتيجة مع مختص عند الحاجة', 'Screening result — discuss the result with a specialist when appropriate'); }
    setResult(`${tr('النتيجة', 'Score')}: ${total}/${questions.length * 3} - ${msg}`);
  };

  const calculateVision = () => {
    const line = formValues.vision_line || '6';
    const eye = formValues.vision_eye || 'both';
    const map: Record<string, string> = {
      '6': tr('طبيعي 6/6', 'Normal 6/6'),
      '9': tr('ضعف خفيف 6/9', 'Mild impairment 6/9'),
      '12': tr('ضعف متوسط 6/12', 'Moderate impairment 6/12'),
      '18': tr('ضعف شديد 6/18', 'Severe impairment 6/18'),
    };
    const desc = map[line] || map['6'];
    setResult(`${tr('الرؤية', 'Vision')} (${eye === 'left' ? tr('العين اليسرى', 'Left eye') : eye === 'right' ? tr('العين اليمنى', 'Right eye') : tr('كلتا العينين', 'Both eyes')}): ${desc}`);
  };

  const handleCalculate = () => {
    if (!activeTest) return;
    switch (activeTest.test_type) {
      case 'bmi': calculateBMI(); break;
      case 'calories': calculateCalories(); break;
      case 'ideal_weight': calculateIdealWeight(); break;
      case 'pregnancy': calculatePregnancy(); break;
      case 'fertility': calculateFertility(); break;
      case 'vision': calculateVision(); break;
      case 'prediabetes':
      case 'asthma':
      case 'depression':
      case 'anxiety':
      case 'ocd':
      case 'ocd_screening':
        calculateQuestionnaire(); break;
      default: setResult(tr('هذا الاختبار سيتوفر قريباً', 'This test will be available soon'));
    }
  };

  const saveResult = async () => {
    if (!activeTest || !result) return;
    await supabase.from('test_results').insert({
      test_id: activeTest.id,
      answers: formValues,
      result: { summary: result },
    });
    setResult(t('tests.saved'));
  };

  const startTest = (test: MedicalTest) => {
    setActiveTest(test);
    setResult(null);
    setFormValues({});
    setQIndex(0);
    setQAnswers({});
  };

  const isQuestionnaire = activeTest && questionnaireMap[activeTest.test_type];
  const questions = isQuestionnaire ? questionnaireMap[activeTest.test_type] : null;

  if (activeTest) {
    const Icon = testIcons[activeTest.test_type] || Calculator;
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <button onClick={() => { setActiveTest(null); setResult(null); setFormValues({}); }} className="text-teal-600 hover:text-teal-700 mb-6 flex items-center gap-2 text-sm font-medium">
            {lang === 'ar' ? '→' : '←'} {t('common.back')}
          </button>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center">
                <Icon className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{getTestTitle(activeTest)}</h1>
                <p className="text-sm text-gray-500">{getTestDescription(activeTest)}</p>
              </div>
            </div>

            {/* Questionnaire mode */}
            {questions && !result && (
              <div>
                <div className="mb-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 transition-all" style={{ width: `${(qIndex / questions.length) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mb-4">{qIndex + 1} / {questions.length}</p>
                <div className="mb-6">
                  <p className="font-medium text-gray-800 mb-4">{lang === 'en' ? questions[qIndex].text_en : questions[qIndex].text}</p>
                  <div className="space-y-2">
                    {questions[qIndex].options.map((opt) => (
                      <button key={opt.value} onClick={() => {
                        const newAnswers = { ...qAnswers, [questions[qIndex].id]: opt.value };
                        setQAnswers(newAnswers);
                        if (qIndex < questions.length - 1) {
                          setQIndex(qIndex + 1);
                        } else {
                          setResult('__pending__');
                          setTimeout(() => {
                            const total = questions.reduce((sum, q) => sum + (newAnswers[q.id] || 0), 0);
                            let msg = '';
                            if (activeTest.test_type === 'prediabetes') {
                              if (total >= 5) msg = tr('مستوى عالي - يُنصح بمراجعة الطبيب', 'High risk - please consult a doctor');
                              else if (total >= 3) msg = tr('مستوى متوسط - يُنصح بالفحص', 'Moderate risk - screening recommended');
                              else msg = tr('مستوى منخفض', 'Low risk');
                            } else if (activeTest.test_type === 'asthma') {
                              if (total <= 2) msg = tr('الربو تحت السيطرة', 'Asthma is well controlled');
                              else if (total <= 5) msg = tr('سيطرة جزئية', 'Partially controlled');
                              else msg = tr('غير محكم السيطرة - راجع الطبيب', 'Uncontrolled - see a doctor');
                            } else if (activeTest.test_type === 'depression') {
                              if (total >= 10) msg = tr('أعراض متوسطة-شديدة - راجع الطبيب', 'Moderate-severe symptoms - see a doctor');
                              else if (total >= 5) msg = tr('أعراض خفيفة-متوسطة', 'Mild-moderate symptoms');
                              else msg = tr('أعراض طبيعية', 'Minimal symptoms');
                            } else if (activeTest.test_type === 'anxiety') {
                              if (total >= 10) msg = tr('قلق متوسط-شديد - راجع الطبيب', 'Moderate-severe anxiety - see a doctor');
                              else if (total >= 5) msg = tr('قلق خفيف-متوسط', 'Mild-moderate anxiety');
                              else msg = tr('أعراض قليلة في هذا الفحص', 'Few symptoms on this screen');
                            } else { msg = tr('نتيجة فحص أولي — ناقش النتيجة مع مختص عند الحاجة', 'Screening result — discuss the result with a specialist when appropriate'); }
                            setResult(`${tr('النتيجة', 'Score')}: ${total}/${questions.length * 3} - ${msg}`);
                          }, 300);
                        }
                      }} className="w-full text-right px-4 py-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors text-gray-700">
                        {lang === 'en' ? opt.label_en : opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {qIndex > 0 && (
                  <button onClick={() => setQIndex(qIndex - 1)} className="text-sm text-gray-500 hover:text-teal-600">
                    {lang === 'ar' ? '→ السابق' : '← Previous'}
                  </button>
                )}
              </div>
            )}

            {/* Input mode for calculators */}
            {!questions && (
              <>
                {(activeTest.test_type === 'bmi' || activeTest.test_type === 'calories' || activeTest.test_type === 'ideal_weight') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('tests.weight')}</label>
                      <input type="number" value={formValues.weight || ''} onChange={(e) => setFormValues({ ...formValues, weight: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('tests.height')}</label>
                      <input type="number" value={formValues.height || ''} onChange={(e) => setFormValues({ ...formValues, height: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
                    </div>
                    {(activeTest.test_type === 'calories' || activeTest.test_type === 'ideal_weight') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tests.age')}</label>
                          <input type="number" value={formValues.age || ''} onChange={(e) => setFormValues({ ...formValues, age: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tests.gender')}</label>
                          <select value={formValues.gender || ''} onChange={(e) => setFormValues({ ...formValues, gender: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none">
                            <option value="">...</option>
                            <option value="male">{t('ask.male')}</option>
                            <option value="female">{t('ask.female')}</option>
                          </select>
                        </div>
                      </>
                    )}
                    {activeTest.test_type === 'calories' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('tests.activity')}</label>
                        <select value={formValues.activity || ''} onChange={(e) => setFormValues({ ...formValues, activity: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none">
                          <option value="1.2">{tr('خامل', 'Sedentary')}</option>
                          <option value="1.375">{tr('خفيف', 'Light')}</option>
                          <option value="1.55">{tr('متوسط', 'Moderate')}</option>
                          <option value="1.725">{tr('شديد', 'Very Active')}</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {(activeTest.test_type === 'pregnancy' || activeTest.test_type === 'fertility') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{tr('تاريخ آخر دورة شهرية', 'Last menstrual period (LMP)')}</label>
                      <input type="date" value={formValues.lmp || ''} onChange={(e) => setFormValues({ ...formValues, lmp: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
                    </div>
                    {activeTest.test_type === 'fertility' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{tr('مدة الدورة (يوم)', 'Cycle length (days)')}</label>
                        <input type="number" value={formValues.cycle || ''} onChange={(e) => setFormValues({ ...formValues, cycle: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
                      </div>
                    )}
                  </div>
                )}

                {activeTest.test_type === 'vision' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{tr('العين', 'Eye')}</label>
                      <select value={formValues.vision_eye || ''} onChange={(e) => setFormValues({ ...formValues, vision_eye: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none">
                        <option value="both">{tr('كلتا العينين', 'Both eyes')}</option>
                        <option value="left">{tr('العين اليسرى', 'Left eye')}</option>
                        <option value="right">{tr('العين اليمنى', 'Right eye')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{tr('أصغر سطر تقرؤه', 'Smallest line you can read')}</label>
                      <select value={formValues.vision_line || ''} onChange={(e) => setFormValues({ ...formValues, vision_line: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none">
                        <option value="6">6/6</option>
                        <option value="9">6/9</option>
                        <option value="12">6/12</option>
                        <option value="18">6/18</option>
                      </select>
                    </div>
                  </div>
                )}

                <button onClick={handleCalculate} className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors">
                  {t('tests.calculate')}
                </button>
              </>
            )}

            {/* Result */}
            {result && result !== '__pending__' && (
              <div className="mt-6 p-6 bg-teal-50 rounded-xl text-center">
                <p className="text-lg font-bold text-teal-800 whitespace-pre-line">{result}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button onClick={saveResult} className="flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2 text-teal-700 text-sm font-medium"><Save className="w-4 h-4" /> {t('tests.save')}</button>
                  <button onClick={()=>{localStorage.setItem('sb1_test_result_draft',result);window.location.href='/doctors?specialty=clinical-psychology'}} className="rounded-xl bg-indigo-50 px-4 py-2 text-indigo-700 text-sm font-medium">إرسال لأخصائي</button>
                  <button onClick={()=>{localStorage.setItem('sb1_test_result_draft',result);window.location.href='/ask'}} className="rounded-xl bg-amber-50 px-4 py-2 text-amber-700 text-sm font-medium">إدراج في سؤال</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('tests.title')}</h1>
          <p className="text-gray-500">{t('tests.subtitle')}</p>
        </div>
        <div className="mb-5 max-w-2xl mx-auto"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tr('ابحث عن اختبار مثل الوسواس أو القلق أو الاكتئاب','Search tests such as OCD, anxiety or depression')} className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm outline-none focus:border-teal-500"/></div><div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.key ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {t(cat.labelKey) !== cat.labelKey ? t(cat.labelKey) : tr('الفئة', cat.key === 'all' ? 'All' : cat.key)}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="text-center text-gray-500">{t('common.loading')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTests.map((test) => {
              const Icon = testIcons[test.test_type] || Calculator;
              return (
                <button key={test.id} onClick={() => startTest(test)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-right hover:shadow-md transition-all hover:border-teal-200 group">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{getTestTitle(test)}</h3>
                  <p className="text-sm text-gray-500">{getTestDescription(test)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-teal-600 text-sm font-medium">
                    {t('tests.start')} <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      <div className="mt-10"><h2 className="text-xl font-extrabold text-gray-800 mb-4">{lang==='ar'?'اختبارات وأدوات رسمية مجانية':'Official free screening resources'}</h2><div className="grid gap-4 md:grid-cols-2">{officialTestResources.map(x=><a key={x.url} href={x.url} target="_blank" rel="noreferrer" className="bg-white rounded-2xl border p-5 hover:border-teal-300"><h3 className="font-bold text-gray-800">{lang==='en'?x.name_en:x.name}</h3><p className="text-xs text-gray-500 mt-2">{x.source}</p><span className="mt-3 inline-block text-teal-600 text-sm font-bold">{lang==='ar'?'فتح المصدر الرسمي':'Open official source'} →</span></a>)}</div></div>
      </div>
    </div>
  );
}
