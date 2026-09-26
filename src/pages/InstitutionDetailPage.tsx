import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, MapPin, Phone, Star, ShoppingBag } from 'lucide-react';
import { useRouter, getPathOnly } from '@/lib/router';
import { demoClinics, demoFacilities, demoLabs, demoProducts, demoRadiology } from '@/lib/demoData';
import { supabase } from '@/lib/supabase';
import { virtualFacilities, languageCountry, countriesForLanguage } from '@/lib/catalog';
import { useI18n } from '@/lib/i18n';

type Kind = 'clinic'|'lab'|'radiology'|'facility';

export default function InstitutionDetailPage({ kind }: { kind: Kind }) {
  const { path, navigate } = useRouter();
  const { lang } = useI18n();
  const id = getPathOnly(path).split('/')[2] || '';
  const [booked, setBooked] = useState(false);
  const [date, setDate] = useState('');
  const [service, setService] = useState('');
  const [data, setData] = useState<any>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [review, setReview] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const table = kind==='clinic' ? 'clinics' : kind==='lab' ? 'lab_centers' : kind==='radiology' ? 'radiology_centers' : 'additional_facilities';
    supabase.from(table).select('*').eq('id', id).maybeSingle().then(({ data: row }) => {
      if (row) setData(row);
      else if (kind==='clinic') setData(demoClinics.find(x=>x.id===id) || null);
      else if (kind==='lab') setData(demoLabs.find(x=>x.id===id) || null);
      else if (kind==='radiology') setData(demoRadiology.find(x=>x.id===id) || null);
      else setData(demoFacilities.find(x=>x.id===id) || countriesForLanguage(lang).flatMap(c=>virtualFacilities(lang,c.key)).find(x=>x.id===id) || null);
    }).catch(() => {
      if (kind==='clinic') setData(demoClinics.find(x=>x.id===id) || null);
      else if (kind==='lab') setData(demoLabs.find(x=>x.id===id) || null);
      else if (kind==='radiology') setData(demoRadiology.find(x=>x.id===id) || null);
      else setData(demoFacilities.find(x=>x.id===id) || countriesForLanguage(lang).flatMap(c=>virtualFacilities(lang,c.key)).find(x=>x.id===id) || null);
    });
  }, [kind, id, lang]);

  if (!data) return <div className="min-h-screen pt-28 text-center" dir="rtl"><h1 className="text-2xl font-bold">جاري تحميل المؤسسة أو المؤسسة غير موجودة</h1><button className="btn-primary mt-5" onClick={()=>navigate('/facilities')}>العودة للمرافق</button></div>;

  const name = data.name;
  const image = 'image_url' in data ? data.image_url : null;
  const services = 'services' in data ? data.services : null;
  const address = data.address || 'العنوان يحدد من المؤسسة';
  const phone = data.phone || '';
  const typeLabel = kind==='clinic'?'عيادة / مستشفى':kind==='lab'?'مختبر تحاليل':kind==='radiology'?'مركز أشعة':'مرفق صحي';

  const priceRows = kind==='clinic'
    ? ['كشف طبي أولي — 25 USD','استشارة متابعة — 18 USD','جلسة فيديو — يحددها الطبيب']
    : kind==='lab'
      ? ['تحاليل دم أساسية — 15 USD','تحاليل شاملة — 35 USD','فحوص متخصصة — يبدأ من 50 USD']
      : kind==='radiology'
        ? ['أشعة X-Ray — 20 USD','Ultrasound — 35 USD','CT / MRI — حسب الخدمة']
        : ['تقييم أولي — 20 USD','جلسة تأهيل — 30 USD','برنامج شهري — حسب الخطة'];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !service) return;
    const bookingTable = kind==='clinic' ? 'clinic_bookings' : kind==='lab' ? 'lab_bookings' : kind==='radiology' ? 'radiology_bookings' : 'facility_bookings';
    const payload:any = { patient_name: patientName.trim() || 'زائر SB1', patient_phone: patientPhone.trim(), scheduled_at: new Date(date).toISOString(), status: 'pending', price: 0 };
    if (kind==='clinic') payload.clinic_id=id;
    if (kind==='lab') { payload.center_id=id; payload.test_type=service; }
    if (kind==='radiology') { payload.center_id=id; payload.service_type=service; }
    if (kind==='facility') payload.facility_id=id;
    const { error } = await supabase.from(bookingTable).insert(payload);
    if (error) {
      const local=JSON.parse(localStorage.getItem('sb1_demo_bookings')||'[]');
      localStorage.setItem('sb1_demo_bookings',JSON.stringify([{...payload,id:`demo-booking-${Date.now()}`,institution_id:id,kind},...local]));
    }
    setBooked(true);
  };

  return <div className="min-h-screen bg-gray-50 pt-24 pb-16" dir="rtl">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <button onClick={()=>navigate(kind==='facility'?'/facilities':kind==='radiology'?'/radiology':`/${kind}s`)} className="mb-5 flex items-center gap-2 text-sm text-gray-500"><ArrowLeft className="h-4 w-4"/>العودة</button>
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
        <div className="grid lg:grid-cols-[1.25fr_1fr]">
          <div className="min-h-[280px] bg-gray-100">{image ? <img src={image} alt={name} className="h-full w-full object-cover"/> : <div className="flex h-full min-h-[280px] items-center justify-center text-gray-300 text-6xl">+</div>}</div>
          <div className="p-7">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{typeLabel}</span>
            <h1 className="mt-3 text-3xl font-extrabold text-gray-900">{name}</h1>
            <div className="mt-3 flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current"/><span className="font-bold">{'rating' in data ? Number(data.rating||4.7).toFixed(1) : '4.8'}</span><span className="text-xs text-gray-400">(مراجعات تجريبية)</span></div>
            <p className="mt-4 leading-7 text-gray-600">{data.description || 'صفحة مؤسسة صحية متكاملة تعرض الخدمات والأسعار والمواعيد والحجز.'}</p>
            <div className="mt-4 space-y-2 text-sm text-gray-600"><p className="flex gap-2"><MapPin className="h-4 w-4 text-teal-600"/>{address}</p>{phone && <p className="flex gap-2"><Phone className="h-4 w-4 text-teal-600"/>{phone}</p>}<p className="flex gap-2"><Clock className="h-4 w-4 text-teal-600"/>09:00 — 21:00 يومياً</p></div>
          </div>
        </div>

        <div className="grid gap-6 border-t border-gray-100 p-7 lg:grid-cols-3">
          <section className="rounded-2xl bg-gray-50 p-5"><h2 className="font-bold text-gray-800">الخدمات</h2><p className="mt-3 text-sm leading-7 text-gray-600">{services || 'خدمات المؤسسة تظهر هنا بالتفصيل ويمكن للمالك تعديلها من لوحة التحكم.'}</p></section>
          <section className="rounded-2xl bg-gray-50 p-5"><h2 className="font-bold text-gray-800">الأسعار</h2><ul className="mt-3 space-y-3 text-sm text-gray-600">{priceRows.map(x=><li key={x} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600"/>{x}</li>)}</ul></section>
          <section className="rounded-2xl bg-teal-50 p-5"><h2 className="font-bold text-gray-800">الحجز</h2>{booked ? <div className="mt-5 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-teal-600"/><p className="mt-2 font-bold text-gray-800">تم إرسال طلب الحجز</p><p className="mt-1 text-xs text-gray-500">ستصل التفاصيل للمؤسسة ويؤكد الموعد.</p></div> : <form onSubmit={handleBook} className="mt-3 space-y-3"><select required value={service} onChange={e=>setService(e.target.value)} className="input-field"><option value="">اختر الخدمة</option>{priceRows.map(x=><option key={x}>{x}</option>)}</select><input required type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} className="input-field"/><input required placeholder="اسم العميل" value={patientName} onChange={e=>setPatientName(e.target.value)} className="input-field"/><input placeholder="رقم الهاتف" value={patientPhone} onChange={e=>setPatientPhone(e.target.value)} className="input-field"/><button className="btn-primary w-full flex items-center justify-center gap-2"><Calendar className="h-4 w-4"/>إرسال طلب الحجز</button></form>}</section>
        </div>

        {kind==='facility' && <div className="border-t border-gray-100 p-7"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><ShoppingBag className="h-5 w-5 text-teal-600"/>منتجات / خدمات المؤسسة</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{demoProducts.map(p=><div key={p.id} className="rounded-2xl border bg-white p-4"><div className="h-32 overflow-hidden rounded-xl bg-gray-100">{p.image_url&&<img src={p.image_url} alt={p.name} className="h-full w-full object-cover"/>}</div><h3 className="mt-3 font-semibold">{p.name}</h3><p className="mt-1 text-sm text-gray-500">{p.description}</p><p className="mt-2 font-bold text-teal-700">{p.price} {p.currency}</p></div>)}</div></div>}
        <div className="border-t border-gray-100 p-7 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-gray-50 p-5"><h2 className="font-bold text-gray-800">المراجعات والتقييمات</h2><div className="mt-3 flex items-center gap-2"><button onClick={()=>setLiked(!liked)} className={'rounded-xl px-4 py-2 '+(liked?'bg-rose-100 text-rose-700':'bg-white border')}>{liked?'♥ أعجبني':'♡ إعجاب'}</button><span className="text-amber-500">★★★★★</span></div><textarea value={review} onChange={e=>setReview(e.target.value)} placeholder="اكتب مراجعتك عن الخدمة..." className="mt-3 input-field min-h-24"/><button onClick={()=>{if(review){localStorage.setItem('sb1_review_'+id,JSON.stringify({review,created_at:new Date().toISOString()}));setReview('')}}} className="mt-2 rounded-xl bg-teal-700 px-4 py-2 font-bold text-white">إرسال المراجعة</button></section>
          <section className="rounded-2xl bg-orange-50 p-5"><h2 className="font-bold text-gray-800">طلبات المؤسسة</h2><p className="mt-2 text-sm text-gray-600">يمكن للمؤسسة إدارة الحسابات، المواعيد، المدفوعات، الإشعارات، الشكاوى، التقارير والمراجعات من لوحة الحساب.</p>{data.facility_type==='pharmacy'&&<button onClick={()=>navigate('/delivery')} className="mt-4 rounded-xl bg-orange-600 px-4 py-2 font-bold text-white">إدارة توصيل الصيدلية</button>}</section>
        </div>
        <div className="border-t border-gray-100 p-7"><h2 className="font-bold text-gray-800">وظائف المؤسسة</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-2xl border bg-white p-4"><b>أخصائي / فني / موظف استقبال</b><p className="mt-1 text-sm text-gray-500">هذه وظيفة تجريبية منشورة على SB1 ويمكن التقديم عليها من جريدة الوظائف.</p><button onClick={()=>navigate('/jobs')} className="mt-3 rounded-xl bg-teal-50 px-4 py-2 font-bold text-teal-700">عرض الوظائف</button></div><div className="rounded-2xl border bg-white p-4"><b>نظام المواعيد والجدولة</b><p className="mt-1 text-sm text-gray-500">مواعيد الخدمة وساعات العمل والحجز تظهر للعميل حسب لغة وبلد المؤسسة.</p></div></div></div>
      </div>
    </div>
  </div>;
}
