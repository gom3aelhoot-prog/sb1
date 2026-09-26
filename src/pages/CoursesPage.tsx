import { useEffect, useState } from 'react';
import { BookOpen, Clock, Users, Star, DollarSign, Check } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Course, type Specialty } from '@/lib/supabase';
import { localizedField } from '@/lib/localizedContent';
import { demoCourses, demoSpecialties } from '@/lib/demoData';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';
import { virtualCoursesForSpecialty } from '@/lib/catalog';
import { clientPrice, clientDiscountLabel } from '@/lib/pricing';
import { getCountryServicePrice } from '@/lib/countryPricing';
import { useApp } from '@/i18n/AppContext';

export default function CoursesPage() {
  const { navigate } = useRouter();
  const { t, specialtyName, lang, dir } = useI18n();
  const { country } = useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);
  const [enrollForm, setEnrollForm] = useState({ name: '', email: '' });
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [courseBasePrice, setCourseBasePrice] = useState({price_usd:19,local_price:19,currency_symbol:"$"});

  useEffect(() => { getCountryServicePrice(country,'course').then(p=>setCourseBasePrice(p)); }, [country.code]);

  useEffect(() => {
    (async () => {
      const { data: specs } = await supabase.from('specialties').select('*').order('name');
      setSpecialties((specs && specs.length ? specs : demoSpecialties) as Specialty[]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('courses').select('*, specialty(*), doctor(*)').eq('is_published', true);
      if (selectedSpecialty) {
        const { data: spec } = await supabase.from('specialties').select('id').eq('slug', selectedSpecialty).maybeSingle();
        if (spec) dbQuery = dbQuery.eq('specialty_id', spec.id);
      }
      const { data } = await dbQuery.order('created_at', { ascending: false });
      const generated = selectedSpecialty ? virtualCoursesForSpecialty(selectedSpecialty, lang, 4) : comprehensiveSpecialties.flatMap(s => virtualCoursesForSpecialty(s.slug, lang, 2));
      const localizedData=(data||[]).filter((x:any)=>!x.translations || x.translations?.[lang]).map((x:any)=>{const tr=x.translations?.[lang]||{};return {...x,title:tr.title||x.title,description:tr.description||x.description}}); const existingIds=new Set(localizedData.map((x:any)=>x.id)); const merged=[...localizedData,...generated.filter((x:any)=>!existingIds.has(x.id))]; setCourses((merged.length ? merged : demoCourses) as Course[]);
      setLoading(false);
    })().catch(() => { setCourses(demoCourses); setLoading(false); });
  }, [selectedSpecialty, lang]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollCourse || !enrollForm.name.trim() || !enrollForm.email.trim()) return;
    setEnrolling(true);
    const { error } = await supabase.from('course_enrollments').insert({
      course_id: enrollCourse.id,
      student_name: enrollForm.name.trim(),
      student_email: enrollForm.email.trim(),
    });
    if (!error) {
      await supabase.from('courses').update({ enrolled_count: (enrollCourse.enrolled_count || 0) + 1 }).eq('id', enrollCourse.id);
      await supabase.from('payments').insert({
        payer_email: enrollForm.email.trim(), payer_name: enrollForm.name.trim(), amount: clientPrice(Number((enrollCourse.price * (courseBasePrice.local_price / courseBasePrice.price_usd)).toFixed(2))),
        currency: country.currency, payment_type: 'course', reference_id: enrollCourse.id, status: 'pending',
      });
    }
    setEnrolling(false);
    setEnrolled(true);
    setTimeout(() => {
      setEnrollCourse(null); setEnrolled(false); setEnrollForm({ name: '', email: '' });
    }, 2500);
  };

  const levelLabels: Record<string, string> = {
    beginner: t('courses.beginner'),
    intermediate: t('courses.intermediate'),
    advanced: t('courses.advanced'),
  };

  const successTitle: any = {
    ar: 'تم التسجيل بنجاح!', ru: 'Регистрация прошла успешно!', de: 'Anmeldung erfolgreich!', en: 'Enrollment successful!'
  }[lang as any] || 'Enrollment successful!';
  const successBody: any = {
    ar: 'ستصلك تفاصيل الدورة على بريدك الإلكتروني', ru: 'Детали курса будут отправлены на вашу электронную почту', de: 'Die Kursdetails werden an Ihre E-Mail-Adresse gesendet', en: 'Course details will be sent to your email'
  }[lang] || 'Course details will be sent to your email';
  const payLabel: any = {
    ar: 'ادفع وسجل الآن', ru: 'Оплатить и записаться', de: 'Bezahlen und anmelden', en: 'Pay & enroll now'
  }[lang] || 'Pay & enroll now';

  return (
    <div className="min-h-screen pt-24 pb-16" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-gray-100 bg-gradient-to-br from-amber-50 via-white to-white p-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <BookOpen className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800">{t('courses.title')}</h1>
          <p className="text-gray-500">{t('courses.subtitle')}</p>
        </div>

        <div className="mb-8 mx-auto max-w-2xl rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <label className="mb-2 block text-sm font-bold text-gray-700">{lang==='ar'?'اختار التخصص':'Choose specialty'}</label>
          <select value={selectedSpecialty} onChange={e=>setSelectedSpecialty(e.target.value)} className="input-field w-full">
            <option value="">{t('common.all')}</option>
            {specialties.map((spec) => <option key={spec.id} value={spec.slug}>{specialtyName(spec)}</option>)}
          </select>
          <p className="mt-2 text-xs text-gray-400">{lang==='ar'?'اختر تخصصاً واحداً ثم ستظهر الدورات الخاصة به فقط.':'Choose one specialty to view only its courses.'}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100" />
                <div className="p-5"><div className="mb-2 h-5 w-3/4 rounded bg-gray-100" /><div className="h-4 w-1/2 rounded bg-gray-100" /></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="card py-20 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-200" />
            <p className="text-lg text-gray-400">{t('courses.no_courses')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const title = localizedField(course as unknown as Record<string, unknown>, 'title', lang, course.title);
              const description = localizedField(course as unknown as Record<string, unknown>, 'description', lang, course.description);
              return (
                <div key={course.id} className="card card-hover group flex flex-col overflow-hidden">
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50">
                    {course.image_url && <img src={course.image_url} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    {course.specialty && <span className="absolute end-3 top-3 badge bg-white/90 text-teal-700 shadow-sm">{specialtyName(course.specialty)}</span>}
                    <span className="absolute start-3 top-3 badge bg-amber-400 text-white shadow-sm">{levelLabels[course.level] || course.level}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-800 group-hover:text-teal-600">{title}</h3>
                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500">{description}</p>
                    <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration_weeks} {t('common.weeks')}</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.lessons_count} {t('courses.lessons')}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.enrolled_count}</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{Number(course.rating).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-2xl font-bold text-teal-600">{clientPrice(Number((course.price * (courseBasePrice.local_price / courseBasePrice.price_usd)).toFixed(2))).toLocaleString(lang==='ar'?'ar-EG':'en-US')} {courseBasePrice.currency_symbol}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/courses/'+course.id)} className="btn-secondary text-sm">تفاصيل</button>
                        <button onClick={() => { setEnrollCourse(course); setEnrolled(false); }} className="btn-primary flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4" />
                          {t('courses.enroll')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {enrollCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEnrollCourse(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {enrolled ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">{successTitle}</h3>
                <p className="text-gray-500">{successBody}</p>
              </div>
            ) : (
              <>
                <h3 className="mb-1 text-xl font-bold text-gray-800">{t('courses.enroll')}</h3>
                <p className="mb-4 text-sm text-gray-500">{localizedField(enrollCourse as unknown as Record<string, unknown>, 'title', lang, enrollCourse.title)}</p>
                <form onSubmit={handleEnroll} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">{t('sessions.patient_name')}</label>
                    <input type="text" value={enrollForm.name} onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">{t('sessions.patient_email')}</label>
                    <input type="email" value={enrollForm.email} onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })} className="input-field" required />
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-teal-50 p-4">
                    <span className="font-medium text-gray-600">{t('courses.price')}</span>
                    <span className="text-2xl font-bold text-teal-600">{Number((enrollCourse.price * (courseBasePrice.local_price / courseBasePrice.price_usd)).toFixed(2)).toLocaleString(lang==='ar'?'ar-EG':'en-US')} {courseBasePrice.currency_symbol}</span>
                  </div>
                  <button type="submit" disabled={enrolling} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50">
                    {enrolling ? t('sessions.booking') : <><DollarSign className="h-5 w-5" />{payLabel}</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}