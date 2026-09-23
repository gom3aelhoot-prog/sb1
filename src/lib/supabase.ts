import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

// Keep the public site renderable when deployment environment variables are not configured yet.
// Database-backed pages will surface a clear configuration error instead of crashing the entire app.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as ReturnType<typeof createClient>, {
      get() {
        throw new Error('SB1 Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      },
    });

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
  pharmacy_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  currency: string;
  delivery_option: string;
  pickup_address: string | null;
  is_active: boolean;
  stock: number;
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
