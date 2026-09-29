import { useEffect, useState } from 'react';
import {
  Stethoscope, HeartPulse, ShieldPlus, Baby, Flower2, Smile,
  Eye, Brain, Activity, Bone, Ear, ArrowLeft, Search, MessageCircle,
  Users, FileText, Star, Clock, TrendingUp, Video, Headphones,
  BookOpen, GraduationCap, Droplet, Syringe, Ambulance, Radiation
} from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Specialty, type Doctor, type Question, type Article, type DoctorVideo, type Course } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import QuestionCard from '@/components/QuestionCard';
import ArticleCard from '@/components/ArticleCard';

const iconMap: Record<string, typeof Stethoscope> = {
  'heart-pulse': HeartPulse,
  'shield-plus': ShieldPlus,
  'baby': Baby,
  'flower-2': Flower2,
  'smile': Smile,
  'eye': Eye,
  'brain': Brain,
  'activity': Activity,
  'bone': Bone,
  'ear': Ear,
  'stethoscope': Stethoscope,
  'droplet': Droplet,
  'syringe': Syringe,
  'shield': ShieldPlus,
  'ambulance': Ambulance,
  'radiation': Radiation,
};

export default function HomePage() {
  const { navigate } = useRouter();
  const { t, lang, specialtyName } = useI18n();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<DoctorVideo[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      const [{ data: specs }, { data: docs }, { data: qs }, { data: arts }, { data: vids }, { data: crs }] = await Promise.all([
        supabase.from('specialties').select('*').order('name'),
        supabase.from('doctors').select('*, specialty(*)').order('rating', { ascending: false }).limit(4),
        supabase.from('questions').select('*, specialty(*), answers(*)').order('created_at', { ascending: false }).limit(4),
        supabase.from('articles').select('*, specialty(*), doctor(*)').order('created_at', { ascending: false }).limit(3),
        supabase.from('doctor_videos').select('*, doctor(*), specialty(*)').order('views', { ascending: false }).limit(3),
        supabase.from('courses').select('*, specialty(*), doctor(*)').eq('is_published', true).order('enrolled_count', { ascending: false }).limit(3),
      ]);
      setSpecialties(specs || []);
      setDoctors(docs || []);
      setQuestions(qs || []);
      setArticles(arts || []);
      setVideos(vids || []);
      setCourses(crs || []);
      setLoading(false);
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const stats = [
    { icon: Users, label: t('stats.doctors'), value: '+18,700' },
    { icon: MessageCircle, label: t('stats.consultations'), value: '+37,000' },
    { icon: FileText, label: t('stats.articles'), value: '+350,000' },
    { icon: HeartPulse, label: t('stats.specialties'), value: '+25' },
  ];

  const services = [
    { icon: Video, title: t('sessions.video_paid'), desc: t('sessions.video_paid_desc'), path: '/sessions', color: 'teal' },
    { icon: MessageCircle, title: t('sessions.free_text'), desc: t('sessions.free_text_desc'), path: '/sessions', color: 'green' },
    { icon: BookOpen, title: t('courses.title'), desc: t('courses.subtitle'), path: '/courses', color: 'amber' },
    { icon: Headphones, title: t('audio.title'), desc: t('audio.subtitle'), path: '/audio', color: 'blue' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-teal-50/40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -end-24 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="absolute -bottom-40 -start-24 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className={`text-center ${lang === 'ar' ? 'lg:text-right' : 'lg:text-left'} animate-fade-in-up`}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                <MessageCircle className="h-4 w-4" />
                {t('nav.ask')}
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-800 sm:text-5xl lg:text-6xl">
                {t('hero.title')}
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 lg:mx-0">
                {t('hero.subtitle')}
              </p>

              <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl lg:mx-0">
                <div className="relative">
                  <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hero.search_placeholder')}
                    className="w-full rounded-2xl border border-gray-200 bg-white py-4 ps-12 pe-28 text-sm shadow-lg shadow-gray-900/5 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                  />
                  <button
                    type="submit"
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    {t('common.search')}
                  </button>
                </div>
              </form>

              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <button onClick={() => navigate('/ask')} className="btn-primary flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {t('hero.ask_now')}
                </button>
                <button onClick={() => navigate('/doctors')} className="btn-secondary flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  {t('hero.browse_doctors')}
                </button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-gray-500 lg:justify-start">
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5">{t('common.free')}</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5">{t('sessions.video_paid')}</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5">{t('courses.title')}</span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5">{t('nav.chat')}</span>
              </div>
            </div>

            <div className="relative hidden lg:block animate-scale-in">
              <div className="absolute -top-10 -end-10 h-48 w-48 rounded-full bg-primary-200/50 blur-3xl" />
              <div className="absolute -bottom-10 -start-10 h-44 w-44 rounded-full bg-teal-200/50 blur-3xl" />

              <div className="relative rounded-3xl bg-gradient-to-br from-primary-500 to-teal-700 p-2 shadow-2xl shadow-primary-500/20">
                <div className="rounded-[1.4rem] bg-white p-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                      <Stethoscope className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{t('sessions.title')}</h3>
                      <p className="mt-1 text-sm text-gray-500">{t('sessions.subtitle')}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <button onClick={() => navigate('/doctors')} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 text-start transition hover:bg-primary-50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50"><HeartPulse className="h-5 w-5 text-primary-600" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{t('doctors.title')}</p>
                        <p className="text-xs text-gray-500">{t('doctors.subtitle')}</p>
                      </div>
                    </button>
                    <button onClick={() => navigate('/courses')} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 text-start transition hover:bg-amber-50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50"><GraduationCap className="h-5 w-5 text-amber-600" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{t('courses.title')}</p>
                        <p className="text-xs text-gray-500">{t('courses.subtitle')}</p>
                      </div>
                    </button>
                    <button onClick={() => navigate('/chat')} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 text-start transition hover:bg-teal-50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50"><MessageCircle className="h-5 w-5 text-teal-600" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{t('chat.title')}</p>
                        <p className="text-xs text-gray-500">{t('chat.subtitle')}</p>
                      </div>
                    </button>
                  </div>

                  <button onClick={() => navigate('/sessions')} className="mt-5 flex w-full items-center justify-between rounded-2xl bg-primary-50 px-4 py-3 text-primary-700 transition hover:bg-primary-100">
                    <span className="flex items-center gap-2 text-sm font-semibold"><Video className="h-4 w-4" />{t('sessions.video_paid')}</span>
                    <span className="text-lg font-bold">$49</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center mb-3">
                  <stat.icon className="w-7 h-7 text-teal-600" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">{t('sessions.title')}</h2>
            <p className="text-gray-500">{t('sessions.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <button key={i} onClick={() => navigate(service.path)} className="card card-hover p-6 text-right group">
                <div className={`w-14 h-14 rounded-2xl bg-${service.color}-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <service.icon className={`w-7 h-7 text-${service.color}-600`} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{service.title}</h3>
                <p className="text-sm text-gray-500">{service.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="border-y border-gray-100 bg-gray-50/60 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`mb-8 ${'text-center'}`}>
            <h2 className="section-title mb-2">{t('nav.more')}</h2>
            <p className="text-gray-500">{t('hero.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MessageCircle, title: t('chat.title'), desc: t('chat.subtitle'), path: '/chat' },
              { icon: BookOpen, title: t('library.title'), desc: t('library.subtitle'), path: '/library' },
              { icon: FileText, title: t('tests.title'), desc: t('tests.subtitle'), path: '/tests' },
              { icon: Clock, title: t('planner.title'), desc: t('planner.subtitle'), path: '/planner' },
            ].map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)} className="card card-hover flex items-start gap-4 p-5 text-start group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 transition-transform group-hover:scale-105">
                  <item.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-16 bg-gradient-to-b from-teal-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">{t('specialties.title')}</h2>
            <p className="text-gray-500">{t('specialties.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 mx-auto mb-3" />
                  <div className="h-4 bg-gray-100 rounded mx-auto w-20" />
                </div>
              ))
            ) : (
              specialties.map((spec) => {
                const Icon = iconMap[spec.icon] || Stethoscope;
                return (
                  <button
                    key={spec.id}
                    onClick={() => navigate(`/doctors?specialty=${spec.slug}`)}
                    className="card card-hover p-6 flex flex-col items-center text-center group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mb-3 group-hover:from-teal-100 group-hover:to-teal-200 transition-all">
                      <Icon className="w-7 h-7 text-teal-600" />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm group-hover:text-teal-600 transition-colors">
                      {specialtyName(spec)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-2">{t('doctors.featured')}</h2>
              <p className="text-gray-500">{t('doctors.featured_sub')}</p>
            </div>
            <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
              {t('doctors.view_all')}
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 mx-auto mb-4" />
                  <div className="h-5 bg-gray-100 rounded mx-auto w-32 mb-2" />
                  <div className="h-4 bg-gray-100 rounded mx-auto w-24" />
                </div>
              ))
            ) : (
              doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)
            )}
          </div>
        </div>
      </section>

      {/* Recent Q&A */}
      <section className="py-16 bg-gradient-to-b from-white to-teal-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-2">{t('questions.title')}</h2>
              <p className="text-gray-500">{t('questions.subtitle')}</p>
            </div>
            <button onClick={() => navigate('/questions')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
              {t('doctors.view_all')}
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            ) : (
              questions.map((q) => <QuestionCard key={q.id} question={q} />)
            )}
          </div>
        </div>
      </section>

      {/* Videos */}
      {videos.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-title mb-2">{t('videos.title')}</h2>
                <p className="text-gray-500">{t('videos.subtitle')}</p>
              </div>
              <button onClick={() => navigate('/videos')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
                {t('doctors.view_all')}
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <button key={vid.id} onClick={() => navigate('/videos')} className="card card-hover overflow-hidden text-right group">
                  <div className="relative h-44 bg-gradient-to-br from-teal-100 to-teal-50 overflow-hidden">
                    {vid.thumbnail_url && (
                      <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6 text-teal-600" />
                      </div>
                    </div>
                    {vid.specialty && <span className="absolute top-3 right-3 badge bg-white/90 backdrop-blur text-teal-700 shadow-sm">{specialtyName(vid.specialty)}</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">{vid.title}</h3>
                    {vid.doctor && <p className="text-sm text-teal-600">{vid.doctor.name}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-teal-50/30 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-title mb-2">{t('courses.title')}</h2>
                <p className="text-gray-500">{t('courses.subtitle')}</p>
              </div>
              <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
                {t('doctors.view_all')}
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <button key={course.id} onClick={() => navigate('/courses')} className="card card-hover overflow-hidden text-right group flex flex-col">
                  <div className="relative h-36 bg-gradient-to-br from-amber-100 to-amber-50 overflow-hidden">
                    {course.image_url && <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <span className="absolute top-3 left-3 badge bg-amber-400 text-white shadow-sm"><GraduationCap className="w-3 h-3 ml-1" />{course.lessons_count} {t('courses.lessons')}</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">{course.title}</h3>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <span className="text-xl font-bold text-teal-600">${course.price}</span>
                      <span className="text-xs text-gray-400">{course.enrolled_count} {t('courses.enrolled')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-2">{t('articles.title')}</h2>
              <p className="text-gray-500">{t('articles.subtitle')}</p>
            </div>
            <button onClick={() => navigate('/articles')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
              {t('doctors.view_all')}
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-100" />
                  <div className="p-5">
                    <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              articles.map((art) => <ArticleCard key={art.id} article={art} />)
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }} />
            <div className="relative">
              <MessageCircle className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('questions.have_question')}
              </h2>
              <p className="text-teal-50 text-lg mb-8 max-w-xl mx-auto">
                {t('questions.ask_doctor')}
              </p>
              <button
                onClick={() => navigate('/ask')}
                className="bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {t('hero.ask_now')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}