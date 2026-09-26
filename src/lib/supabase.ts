import { createClient } from '@supabase/supabase-js';
import { demoSpecialties, demoDoctors, demoArticles, demoVideos, demoAudio, demoCourses, demoClinics, demoLabs, demoRadiology, demoFacilities, demoProducts, demoLibrary, demoQuestions, demoAnswers } from '@/lib/demoData';
import { defaultStoreProducts } from '@/lib/storeCatalog';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

type DemoRow = Record<string, any>;
const now = new Date().toISOString();
const demoTables: Record<string, DemoRow[]> = {
  specialties: demoSpecialties, doctors: demoDoctors, articles: demoArticles, doctor_videos: demoVideos, doctor_audio: demoAudio,
  courses: demoCourses, clinics: demoClinics, lab_centers: demoLabs, radiology_centers: demoRadiology,
  questions: demoQuestions, answers: demoAnswers,
  additional_facilities: demoFacilities, pharmacy_products: demoProducts, specialty_library_items: demoLibrary,
  sb1_specialist_registration_requests: [
    {id:'req-demo-1',name:'أخصائي تجريبي',email:'pending@sb1.demo',phone:'',specialty_id:demoSpecialties[0]?.id||null,country_code:'SY',language_code:'ar',documents:{},status:'pending',created_at:now},
  ],
  sb1_team_chat_rooms: [
    {id:'team-owner',name:'المالك + المشرفون',description:'مجموعة خاصة يحدد المالك أعضاءها',member_count:3,created_at:now,is_active:true},
    {id:'team-pediatrics',name:'فريق الأطفال المختار',description:'غرفة خاصة لأخصائيي الأطفال المختارين',member_count:4,created_at:now,is_active:true},
  ],
  sb1_team_chat_messages: [
    {id:'tm1',room_id:'team-owner',sender_name:'المالك',sender_role:'owner',body:'مرحباً بفريق الإدارة.',created_at:now},
  ],
  sb1_pediatric_library_rooms: [
    {id:'p-room-1',name:'التقييم والتشخيص',description:'صور وفيديوهات وملفات تعليمية',owner_id:'owner',is_active:true,created_at:now},
    {id:'p-room-2',name:'إعادة التأهيل للأطفال',description:'مواد تبادل الخبرات',owner_id:'owner',is_active:true,created_at:now},
  ],
  sb1_pediatric_library_posts: [
    {id:'p-post-1',room_id:'p-room-1',title:'مثال تعليمي',body:'مادة تجريبية لتبادل الخبرة بين الأخصائيين.',media_url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',media_type:'video',author_name:'SB1',likes_count:4,comments_count:1,shares_count:2,created_at:now},
  ],
  sb1_pediatric_library_comments: [
    {id:'p-comment-1',post_id:'p-post-1',author_name:'أخصائي تجريبي',body:'مفيد، شكراً.',created_at:now},
  ],
  sb1_team_chat_members: [
    {id:'tmember-owner',room_id:'team-owner',member_name:'المالك',member_role:'owner',created_at:now},
    {id:'tmember-mod',room_id:'team-owner',member_name:'مشرف SB1',member_role:'moderator',created_at:now},
  ],
    question_pricing_rules: [{ id:'pricing-demo', country_code:null, currency_code:'USD', base_price:9, duration_days:7, notification_reach:10, min_answers:1, max_answers:3, response_speed:'standard', is_active:true }],
  pricing_tiers: [
    { id:'basic', name:'Basic', name_ar:'الأساسية', description:'Standard response', description_ar:'رد قياسي', duration_days:7, specialists_notified:10, min_answers:1, max_answers:3, response_speed:'standard', price_usd:9, is_featured:false, is_active:true, sort_order:1 },
    { id:'plus', name:'Plus', name_ar:'المعززة', description:'Faster response', description_ar:'رد أسرع', duration_days:14, specialists_notified:25, min_answers:2, max_answers:5, response_speed:'fast', price_usd:19, is_featured:true, is_active:true, sort_order:2 },
    { id:'premium', name:'Premium', name_ar:'المميزة', description:'Priority response', description_ar:'أولوية', duration_days:30, specialists_notified:50, min_answers:3, max_answers:10, response_speed:'instant', price_usd:39, is_featured:false, is_active:true, sort_order:3 },
  ],
  subscription_plans: [
    { id:'sub-free', name:'Free', name_ar:'مجاني', duration_months:1, price:0, daily_questions_limit:1, weekly_questions_limit:3, free_courses_limit:0, free_books_limit:1, features:'سؤال مجاني، مكتبة أساسية', is_active:true, created_at:now },
    { id:'sub-plus', name:'Plus', name_ar:'بلس', duration_months:1, price:9.99, daily_questions_limit:3, weekly_questions_limit:10, free_courses_limit:1, free_books_limit:5, features:'أسئلة أكثر، كتب ودورات مخفضة', is_active:true, created_at:now },
    { id:'sub-pro', name:'Pro', name_ar:'احترافي', duration_months:1, price:24.99, daily_questions_limit:10, weekly_questions_limit:30, free_courses_limit:3, free_books_limit:20, features:'أولوية، مكتبة كاملة، خصومات', is_active:true, created_at:now },
  ],
  site_settings: [{ id:1, site_name:'SB1', default_language:'ar', free_session_messages:3, video_session_price:25, currency:'USD', ai_moderation_enabled:true, stripe_enabled:false, updated_at:now }],
  admin_users: [],
  payments: [], video_sessions: [], text_sessions: [], specialist_planner: [], planner_reminders: [], lab_bookings: [], radiology_bookings: [], clinic_bookings: [],
  specialist_documents: [], specialist_posts: [], specialist_diary: [], post_comments: [], user_follows: [],
  medical_tests: [], test_results: [], ai_report_analysis: [], favorites: [], advertisements: [], jobs: [], job_applications: [], referral_rewards: [],
  country_pricing: [], institutions: [], delivery_workers: [], admin_chat_messages: [],
  store_products: defaultStoreProducts, store_orders: [],
  signup_promotions: [{ id:'promo-demo', code:'SB1-FIRST-SIGNUP', discount_percent:10, is_active:true }],
};

const demoStorageKey = 'sb1_demo_db_v2';
const readDemoTable = (table:string): DemoRow[] => {
  if (typeof window === 'undefined') return [...(demoTables[table] || [])];
  try {
    const saved = JSON.parse(window.localStorage.getItem(demoStorageKey) || '{}');
    if (Array.isArray(saved[table])) return saved[table];
  } catch {}
  return [...(demoTables[table] || [])];
};
const writeDemoTable = (table:string, rows:DemoRow[]) => {
  if (typeof window === 'undefined') return;
  try {
    const saved = JSON.parse(window.localStorage.getItem(demoStorageKey) || '{}');
    saved[table] = rows;
    window.localStorage.setItem(demoStorageKey, JSON.stringify(saved));
  } catch {}
};
const makeId = (table:string) => `demo-${table}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

class DemoQuery implements PromiseLike<{data:any;error:any}> {
  private rows: DemoRow[]; private filters: ((row:DemoRow)=>boolean)[]=[]; private sortKey:string|null=null; private ascending=true; private maxRows:number|null=null; private singleRow=false;
  private countMode=false; private headMode=false; private mutation:'insert'|'update'|'delete'|null=null; private mutationPayload:any=null;
  constructor(private table:string){this.rows=readDemoTable(table);}
  select(_columns='*', opts?:{count?:'exact'|'planned'|'estimated';head?:boolean}){this.countMode=!!opts?.count;this.headMode=!!opts?.head;return this;}
  eq(k:string,v:any){this.filters.push(r=>r[k]===v);return this;} neq(k:string,v:any){this.filters.push(r=>r[k]!==v);return this;}
  in(k:string,values:any[]){this.filters.push(r=>values.includes(r[k]));return this;}
  ilike(k:string,p:string){const n=p.replace(/%/g,'').toLowerCase();this.filters.push(r=>String(r[k]??'').toLowerCase().includes(n));return this;}
  gte(k:string,v:any){this.filters.push(r=>String(r[k]??'')>=String(v));return this;} lte(k:string,v:any){this.filters.push(r=>String(r[k]??'')<=String(v));return this;}
  order(k:string,o?:{ascending?:boolean}){this.sortKey=k;this.ascending=o?.ascending!==false;return this;} limit(n:number){this.maxRows=n;return this;} range(_f:number,t:number){this.maxRows=t+1;return this;}
  maybeSingle(){this.singleRow=true;return this;} single(){this.singleRow=true;return this;}
  insert(values:any){this.mutation='insert';this.mutationPayload=Array.isArray(values)?values: [values];return this;}
  update(values:any){this.mutation='update';this.mutationPayload=values;return this;}
  delete(){this.mutation='delete';return this;}
  then<TResult1={data:any;error:any},TResult2=never>(ok?:((v:{data:any;error:any;count?:number})=>TResult1|PromiseLike<TResult1>)|null,bad?:((e:any)=>TResult2|PromiseLike<TResult2>)|null):Promise<TResult1|TResult2>{
    try {
      let result=this.rows.filter(r=>this.filters.every(f=>f(r))).map(r=>({...r}));
      if(this.mutation==='insert'){
        result=this.mutationPayload.map((v:any)=>({...v,id:v.id||makeId(this.table),created_at:v.created_at||new Date().toISOString()}));
        const all=readDemoTable(this.table); writeDemoTable(this.table,[...result,...all]);
      } else if(this.mutation==='update'){
        const all=readDemoTable(this.table); const changed=all.map(r=>this.filters.every(f=>f(r))?{...r,...this.mutationPayload}:r); writeDemoTable(this.table,changed); result=changed.filter(r=>this.filters.every(f=>f(r)));
      } else if(this.mutation==='delete'){
        const all=readDemoTable(this.table); const kept=all.filter(r=>!this.filters.every(f=>f(r))); writeDemoTable(this.table,kept); result=[];
      }
      if(this.sortKey)result.sort((a,b)=>{const av=a[this.sortKey!],bv=b[this.sortKey!];return av===bv?0:(av>bv?1:-1)*(this.ascending?1:-1)});
      if(this.maxRows!==null)result=result.slice(0,this.maxRows);
      const count=result.length;
      const payload={data:this.headMode?null:(this.singleRow?(result[0]??null):result),error:null,count};
      return Promise.resolve(payload).then(ok as any,bad as any);
    } catch(e){return Promise.reject(e).then(ok as any,bad as any)}
  }
}
const demoClient={
  from:(table:string)=>new DemoQuery(table),
  rpc:(_fn:string,_args?:any)=>Promise.resolve({data:null,error:null}),
  auth:{
    signUp:async({email,password,options}:{email:string;password:string;options?:{data?:any}})=>{
      const user={id:makeId('user'),email,user_metadata:options?.data||{}};
      if(typeof window!=='undefined') window.localStorage.setItem('sb1_demo_auth',JSON.stringify({user}));
      return {data:{user,session:{user}},error:null};
    },
    signInWithPassword:async({email,password}:{email:string;password:string})=>{
      const saved=typeof window!=='undefined'?window.localStorage.getItem('sb1_demo_auth'):null;
      if(saved){const parsed=JSON.parse(saved); if(parsed.user?.email===email) return {data:{user:parsed.user,session:{user:parsed.user}},error:null};}
      return {data:{user:{id:makeId('user'),email},session:{user:{id:makeId('user'),email}}},error:null};
    },
    signOut:async()=>{if(typeof window!=='undefined')window.localStorage.removeItem('sb1_demo_auth');return {error:null};},
    getUser:async()=>{try{const saved=typeof window!=='undefined'?window.localStorage.getItem('sb1_demo_auth'):null;return {data:{user:saved?JSON.parse(saved).user:null},error:null};}catch{return {data:{user:null},error:null};}}
  }
};
export const supabase: any = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl,supabaseAnonKey) : demoClient;

export type Specialty = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  name_en: string | null;
  name_de: string | null;
  name_ru: string | null;
  description_en: string | null;
  description_de: string | null;
  description_ru: string | null;
  created_at: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialty_id: string;
  bio: string;
  education: string;
  experience_years: number;
  photo_url: string;
  city: string;
  rating: number;
  consultation_count: number;
  native_language: string | null;
  is_online: boolean;
  is_verified: boolean;
  is_virtual: boolean;
  phone_number: string | null;
  follower_count: number;
  nationality: string | null;
  country_code?: string | null;
  language_code?: string | null;
  approval_status?: string;
  created_at: string;
  specialty?: Specialty;
};

export type Question = {
  id: string;
  specialty_id: string;
  author_name: string;
  title: string;
  body: string;
  age: number | null;
  gender: string | null;
  status: string;
  views: number;
  created_at: string;
  language?: string;
  specialty?: Specialty;
  answers?: Answer[];
};

export type Answer = {
  id: string;
  question_id: string;
  doctor_id: string;
  body: string;
  helpful_count: number;
  created_at: string;
  doctor?: Doctor;
};

export type Article = {
  id: string;
  specialty_id: string;
  doctor_id: string | null;
  title: string;
  excerpt: string;
  body: string;
  image_url: string;
  reading_time_min: number;
  views: number;
  created_at: string;
  specialty?: Specialty;
  doctor?: Doctor;
};

export type DoctorVideo = {
  id: string;
  doctor_id: string;
  specialty_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  views: number;
  created_at: string;
  doctor?: Doctor;
  specialty?: Specialty;
};

export type DoctorAudio = {
  id: string;
  doctor_id: string;
  specialty_id: string;
  title: string;
  description: string;
  audio_url: string;
  duration_seconds: number;
  listens: number;
  created_at: string;
  doctor?: Doctor;
  specialty?: Specialty;
};

export type Course = {
  id: string;
  specialty_id: string;
  doctor_id: string | null;
  title: string;
  description: string;
  image_url: string;
  price: number;
  duration_weeks: number;
  lessons_count: number;
  level: string;
  enrolled_count: number;
  rating: number;
  is_published: boolean;
  created_at: string;
  specialty?: Specialty;
  doctor?: Doctor;
};

export type VideoSession = {
  id: string;
  doctor_id: string;
  patient_name: string;
  patient_email: string;
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  status: string;
  meeting_url: string;
  recording_url: string;
  is_recorded: boolean;
  created_at: string;
  doctor?: Doctor;
};

export type TextSession = {
  id: string;
  doctor_id: string;
  patient_name: string;
  specialty_id: string;
  status: string;
  message_count: number;
  max_messages: number;
  created_at: string;
  doctor?: Doctor;
  specialty?: Specialty;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  sender_type: string;
  sender_name: string;
  body: string;
  is_flagged: boolean;
  created_at: string;
};

export type Payment = {
  id: string;
  payer_email: string;
  payer_name: string;
  amount: number;
  currency: string;
  payment_type: string;
  reference_id: string;
  status: string;
  stripe_session_id: string;
  created_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

export type AIViolation = {
  id: string;
  source_type: string;
  source_id: string;
  user_name: string;
  content_snippet: string;
  violation_type: string;
  severity: string;
  status: string;
  ai_response: string;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  site_name: string;
  default_language: string;
  free_session_messages: number;
  video_session_price: number;
  currency: string;
  ai_moderation_enabled: boolean;
  stripe_enabled: boolean;
  updated_at: string;
};

export type SpecialistPost = {
  id: string;
  doctor_id: string;
  body: string;
  image_url: string | null;
  video_url: string | null;
  post_type: string;
  views: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  doctor?: Doctor;
};

export type SpecialistReel = {
  id: string;
  doctor_id: string;
  title: string | null;
  video_url: string;
  thumbnail_url: string | null;
  views: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  doctor?: Doctor;
};

export type SpecialistDiary = {
  id: string;
  doctor_id: string;
  title: string | null;
  body: string;
  mood: string | null;
  is_public: boolean;
  created_at: string;
};

export type PostComment = {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export type SpecialtyChatRoom = {
  id: string;
  specialty_id: string;
  name: string;
  description: string | null;
  member_count: number;
  created_at: string;
  specialty?: Specialty;
};

export type ChatRoomMessage = {
  id: string;
  room_id: string;
  sender_name: string;
  sender_type: string;
  body: string;
  is_flagged: boolean;
  created_at: string;
};

export type SpecialtyLibraryItem = {
  id: string;
  specialty_id: string;
  item_type: string;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  source: string | null;
  is_auto_generated: boolean;
  created_at: string;
  specialty?: Specialty;
};

export type SpecialistDocument = {
  id: string;
  doctor_id: string;
  doc_type: string;
  doc_url: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  name_ar: string | null;
  duration_months: number;
  price: number;
  daily_questions_limit: number | null;
  weekly_questions_limit: number | null;
  free_courses_limit: number | null;
  free_books_limit: number | null;
  features: string | null;
  is_active: boolean;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_email: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  plan?: SubscriptionPlan;
};

export type SpecialistPlanner = {
  id: string;
  doctor_id: string;
  session_type: string;
  client_name: string;
  client_email: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  price: number;
  notes: string | null;
  created_at: string;
  doctor?: Doctor;
};

export type PlannerReminder = {
  id: string;
  planner_id: string;
  reminder_type: string;
  remind_at: string;
  is_sent: boolean;
  created_at: string;
};

export type Clinic = {
  id: string;
  doctor_id: string | null;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  doctor?: Doctor;
};

export type ClinicBooking = {
  id: string;
  clinic_id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  scheduled_at: string;
  status: string;
  price: number;
  created_at: string;
  clinic?: Clinic;
};

export type RadiologyCenter = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  image_url: string | null;
  services: string | null;
  is_active: boolean;
  created_at: string;
};

export type RadiologyBooking = {
  id: string;
  center_id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  service_type: string | null;
  scheduled_at: string;
  status: string;
  price: number;
  created_at: string;
  center?: RadiologyCenter;
};

export type LabCenter = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  image_url: string | null;
  services: string | null;
  is_active: boolean;
  created_at: string;
};

export type LabBooking = {
  id: string;
  center_id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  test_type: string | null;
  scheduled_at: string;
  status: string;
  price: number;
  created_at: string;
  center?: LabCenter;
};

export type Advertisement = {
  id: string;
  doctor_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  target_url: string | null;
  placement: string;
  start_date: string | null;
  end_date: string | null;
  price: number;
  status: string;
  impressions: number;
  clicks: number;
  created_at: string;
  doctor?: Doctor;
};

export type Badge = {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  icon: string;
  color: string;
  requirement_type: string | null;
  requirement_value: number | null;
  is_purchasable: boolean;
  price: number;
  created_at: string;
};

export type UserBadge = {
  id: string;
  badge_id: string;
  user_email: string;
  doctor_id: string;
  is_earned: boolean;
  is_purchased: boolean;
  earned_at: string;
  badge?: Badge;
};

export type SitePolicy = {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
};

export type PolicyAcceptance = {
  id: string;
  user_email: string | null;
  user_name: string | null;
  policy_id: string;
  accepted_at: string;
};

export type SpecialistStoreProduct = {
  id: string;
  product_type: string;
  name: string;
  quantity: number;
  price: number;
  is_active: boolean;
  created_at: string;
};

export type StorePurchase = {
  id: string;
  doctor_id: string | null;
  product_id: string;
  target_type: string | null;
  target_id: string | null;
  quantity: number;
  status: string;
  created_at: string;
};

export type EngagementBoost = {
  id: string;
  target_type: string;
  target_id: string;
  boost_type: string;
  amount: number;
  applied_by: string | null;
  created_at: string;
};

export type SessionSchedule = {
  id: string;
  doctor_id: string;
  available_from: string | null;
  available_to: string | null;
  is_booked: boolean;
  client_name: string | null;
  client_email: string | null;
  client_preferred_times: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type UserFollow = {
  id: string;
  follower_email: string;
  doctor_id: string;
  created_at: string;
};

export type SubSpecialty = {
  id: string;
  parent_specialty_id: string;
  name: string;
  name_en: string | null;
  name_de: string | null;
  name_ru: string | null;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

export type QuestionComment = {
  id: string;
  question_id: string;
  author_name: string;
  author_type: string;
  body: string;
  created_at: string;
};

export type AnswerRating = {
  id: string;
  answer_id: string;
  rater_name: string;
  rating: number;
  created_at: string;
};

export type BestAnswer = {
  id: string;
  question_id: string;
  answer_id: string;
  selected_by: string;
  rank: number;
  created_at: string;
};

export type AnswerPayment = {
  id: string;
  answer_id: string;
  doctor_id: string | null;
  question_price: number;
  platform_share: number;
  doctor_share: number;
  rating: number;
  status: string;
  calculated_at: string;
};

export type MedicalTest = {
  id: string;
  test_type: string;
  title: string;
  title_en: string | null;
  description: string;
  category: string;
  questions: Record<string, unknown> | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
};

export type TestResult = {
  id: string;
  test_id: string;
  user_name: string | null;
  user_email: string | null;
  answers: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  created_at: string;
};

export type AdditionalFacility = {
  id: string;
  facility_type: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  services: string | null;
  schedule: Record<string, unknown> | null;
  rating: number;
  is_active: boolean;
  created_at: string;
};

export type PharmacyProduct = {
  id: string;
  pharmacy_id?: string | null;
  facility_id?: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  currency: string;
  delivery_option?: string;
  pickup_address?: string | null;
  is_active: boolean;
  stock?: number;
  stock_quantity?: number;
  created_at: string;
};

export type Institution = {
  id: string;
  name: string;
  type: string;
  service_type: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  logo_url: string | null;
  documents: Record<string, unknown> | null;
  schedule: Record<string, unknown> | null;
  service_info: string | null;
  is_approved: boolean;
  subscription_plan: string | null;
  created_at: string;
};

export type Job = {
  id: string;
  institution_id: string | null;
  title: string;
  description: string | null;
  requirements: string | null;
  salary_range: string | null;
  location: string | null;
  job_type: string;
  is_active: boolean;
  created_at: string;
};

export type JobApplication = {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  status: string;
  created_at: string;
};

export type ReferralReward = {
  id: string;
  referrer_name: string;
  referrer_email: string | null;
  referred_email: string | null;
  referral_code: string;
  total_referrals: number;
  total_paid_amount: number;
  reward_amount: number;
  status: string;
  created_at: string;
};

export type CountryPricing = {
  id: string;
  country_code: string;
  country_name: string;
  currency_code: string;
  currency_symbol: string;
  service_type: string;
  price: number;
  is_active: boolean;
  created_at: string;
};

export type AIReportAnalysis = {
  id: string;
  user_name: string | null;
  user_email: string | null;
  report_type: string;
  file_url: string | null;
  analysis_result: string | null;
  recommendations: string | null;
  is_paid: boolean;
  status: string;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_email: string;
  item_type: string;
  item_id: string;
  created_at: string;
};

export type DeliveryWorker = {
  id: string;
  name: string;
  email: string;
  phone: string;
  pharmacy_id: string | null;
  vehicle_type: string | null;
  zone: string | null;
  is_active: boolean;
  created_at: string;
};

export type AdminChatMessage = {
  id: string;
  sender_name: string;
  sender_role: string;
  recipient_name: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
};
