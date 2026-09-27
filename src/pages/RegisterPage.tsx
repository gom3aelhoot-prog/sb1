import { useState } from 'react';
import { User, Stethoscope, Upload, Check, FileText, Shield, UserCircle, ArrowRight, Bike } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { supabase, type Specialty } from '@/lib/supabase';
import { useEffect } from 'react';
import { COUNTRY_OPTIONS } from '@/types/i18n';
import { useApp } from '@/i18n/AppContext';

const countryLabels: Record<string,string> = {SA:'السعودية',AE:'الإمارات',EG:'مصر',IQ:'العراق',JO:'الأردن',KW:'الكويت',LB:'لبنان',LY:'ليبيا',MA:'المغرب',OM:'عمان',PS:'فلسطين',QA:'قطر',SY:'سوريا',TN:'تونس',YE:'اليمن',DZ:'الجزائر',BH:'البحرين',MR:'موريتانيا',SD:'السودان',SO:'الصومال',KM:'جزر القمر',DJ:'جيبوتي',US:'United States',DE:'Deutschland',RU:'Россия',UZ:'Oʻzbekiston',AM:'Հայաստան',TJ:'Тоҷикистон',UA:'Україна',AZ:'Azərbaycan',GE:'საქართველო',ET:'ኢትዮጵያ'};

export default function RegisterPage() {
  const { t, specialtyName, lang } = useI18n();
  const { country, setCountry } = useApp();
  const { navigate } = useRouter();
  const [accountType, setAccountType] = useState<'client' | 'specialist' | 'institution' | 'delivery_worker' | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', age: '', parentalConsent: false, specialty: '',
    showName: true, anonymous: false, institutionType: 'clinic', address: '', services: '', deliveryEnabled: false, deliveryMethod: 'platform', schedule: '', documents: '',
  });
  const [docUrls, setDocUrls] = useState<{ id?: string; cert?: string; license?: string }>({});
  const [institutionFiles, setInstitutionFiles] = useState<string[]>([]);
  const [registrationCountry, setRegistrationCountry] = useState(country);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const referralCode = new URLSearchParams(window.location.search).get('ref') || '';

  useEffect(() => {
    supabase.from('specialties').select('*').order('name').then(({ data }) => setSpecialties(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { alert(lang === 'ar' ? 'يجب قراءة وقبول العقد والقواعد قبل التسجيل.' : 'Please accept the agreement and rules before registration.'); return; }
    const age=Number(formData.age||0);
    if(age>0 && age<18 && !formData.parentalConsent){ alert(lang==='ar'?'يجب إرفاق موافقة كتابية من ولي الأمر لمن هو دون 18 عاماً.':'Written parental consent is required for users under 18.'); return; }
    setSubmitting(true); setSuccess(false);
    try {
      const email = formData.email.trim().toLowerCase();
      if (accountType === 'specialist') {
        const { error } = await supabase.from('sb1_specialist_registration_requests').insert({
          id: 'req-' + Date.now(), name: formData.name, email, phone: formData.phone,
          specialty_id: formData.specialty || null, age: age || null, parental_consent: Boolean(formData.parentalConsent), country_code: registrationCountry.code,
          language_code: lang, documents: { id: docUrls.id || null, certificate: docUrls.cert || null, license: docUrls.license || null },
          status: 'pending', created_at: new Date().toISOString()
        });
        if (error) throw error;
        setSuccess(true);
        return;
      }
      const authResult = await supabase.auth.signUp({ email, password: formData.password, options: { data: { name: formData.name, role: accountType, age: age || null, parental_consent: Boolean(formData.parentalConsent), country_code: registrationCountry.code, language_code: lang } } });
      if (authResult.error) throw authResult.error;
      try {
        let parentId:any = null;
        if (referralCode) { const p = await supabase.from('affiliate_members').select('id,level').eq('referral_code',referralCode).maybeSingle(); parentId = p.data?.id || null; }
        const parentLevel = parentId ? Number((await supabase.from('affiliate_members').select('level').eq('id',parentId).maybeSingle()).data?.level || 0) : -1;
        await supabase.from('affiliate_members').insert({user_id:authResult.data.user?.id||null,name:formData.name,email,member_type:accountType||'client',referral_code:'SB1-'+Date.now().toString(36).toUpperCase(),parent_id:parentId,level:parentId?parentLevel+1:0,country_code:registrationCountry.code,language_code:lang,points:0,wallet_balance:0,total_sales:0,status:'active'});
      } catch {}
      try { await supabase.from('newsletter_subscribers').upsert({email,name:formData.name,language_code:lang,country_code:registrationCountry.code,is_active:true},{onConflict:'email'}); } catch {}
      if (accountType === 'delivery_worker') { const { error } = await supabase.from('sb1_delivery_workers').insert({name:formData.name,phone:formData.phone,city:formData.address||'',status:'pending',documents:{files:institutionFiles},country_code:registrationCountry.code,language_code:lang}); if(error) throw error; }
      if (accountType === 'client') {
        const { error } = await supabase.from('profiles').insert({ id: authResult.data.user?.id, name: formData.anonymous ? 'مجهول' : formData.name, email, phone: formData.phone, role: 'client', country_code: registrationCountry.code, language_code: lang, is_anonymous: formData.anonymous });
        if (error) throw error;
      } else if (accountType === 'institution') {
        const { error } = await supabase.from('institutions').insert({ name: formData.name, type: formData.institutionType, address: formData.address, phone: formData.phone, email, service_info: formData.services, schedule_info: formData.schedule, documents_info: formData.documents, document_files: institutionFiles, delivery_enabled: formData.deliveryEnabled, delivery_method: formData.deliveryMethod, delivery_worker_policy: formData.deliveryMethod==='platform'?'all':'institution_workers', is_approved: false, subscription_plan: 'free', country_code: registrationCountry.code, language_code: lang });
        if (error) throw error;
      }
      localStorage.removeItem('sb1_guest_client');
      localStorage.setItem('sb1_account_role', accountType || 'client');
      localStorage.setItem('sb1_account_email', email);
      if (authResult.data.user?.id) localStorage.setItem('sb1_account_user_id', authResult.data.user.id);
      setSuccess(true);
    } catch (err: any) {
      alert(err?.message || 'تعذر إرسال الطلب');
    } finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('register.success')}</h2>
          {accountType === 'specialist' && (
            <p className="text-sm text-gray-500 mb-4">تم استلام طلب الأخصائي للمراجعة. لا يتم إنشاء أو تفعيل حساب أخصائي ولا يظهر للجمهور قبل موافقة المالك أو الإدارة.</p>
          )}
          <button onClick={() => navigate('/')} className="btn-primary">{t('common.back')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">{t('register.title')}</h1>
        <p className="text-gray-500 text-center mb-8">{t('register.subtitle')}</p>

        {!accountType ? (
          <>
          <div className="mb-5 rounded-2xl border border-teal-200 bg-teal-50 p-5 text-center">
            <h3 className="font-extrabold text-teal-900">عميل بدون إنشاء حساب</h3>
            <p className="mt-1 text-sm text-teal-700">يمكن للعملاء فقط الدخول كزائر وتصفح الموقع وطرح الأسئلة العامة.</p>
            <button type="button" onClick={()=>{localStorage.setItem('sb1_guest_client','true');localStorage.removeItem('sb1_account_role');window.location.href='/'}} className="btn-primary mt-3">الدخول كعميل بدون حساب</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setAccountType('client')}
              className="card p-8 text-center hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UserCircle className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{t('register.client')}</h3>
              <p className="text-sm text-gray-500">{t('register.client_desc')}</p>
            </button>
            <button
              onClick={() => setAccountType('specialist')}
              className="card p-8 text-center hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{t('register.specialist')}</h3>
              <p className="text-sm text-gray-500">{t('register.specialist_desc')}</p>
            </button>
            <button
              onClick={() => setAccountType('institution')}
              className="card p-8 text-center hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">تسجيل مؤسسة</h3>
              <p className="text-sm text-gray-500">عيادة، مختبر، أشعة، مستشفى، صيدلية أو مركز تأهيل</p>
            </button>
          <button onClick={() => setAccountType('delivery_worker')} className="card p-8 text-center hover:shadow-lg transition-all group"><div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Bike className="w-8 h-8 text-orange-600" /></div><h3 className="text-lg font-bold text-gray-800 mb-1">تسجيل عامل توصيل</h3><p className="text-sm text-gray-500">حساب مستقل لاستلام طلبات التوصيل وإشعاراتها.</p></button></div>
        </>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <button type="button" onClick={() => setAccountType(null)} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              <ArrowRight className="w-4 h-4 rotate-180" />
              {t('common.back')}
            </button>

            <div className="rounded-2xl border-2 border-teal-100 bg-teal-50 p-4">
              <label className="block text-sm font-bold text-teal-900 mb-2">{lang === 'ar' ? 'الدولة — أساسي لتحديد الأسعار والخدمات' : 'Country — required for pricing and services'}</label>
              <select required value={registrationCountry.code} onChange={(e)=>{const next=COUNTRY_OPTIONS.find(c=>c.code===e.target.value)||country;setRegistrationCountry(next);setCountry(next)}} className="input-field bg-white">
                {COUNTRY_OPTIONS.map(c=><option key={c.code} value={c.code}>{c.flag} {countryLabels[c.code] || c.nameKey} — {c.currencySymbol}</option>)}
              </select>
              <p className="mt-2 text-xs text-teal-700">{lang === 'ar' ? 'سيتم استخدام الدولة لتحديد عملة وأسعار الخدمات عند الدفع.' : 'This country determines the currency and country-specific service prices at checkout.'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('register.name')}</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('register.email')}</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('register.password')}</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('register.phone')}</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
            </div>

            {accountType === 'institution' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نوع المؤسسة</label>
                  <select value={formData.institutionType} onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })} className="input-field">
                    <option value="clinic">عيادة / مستشفى</option><option value="lab">مختبر</option><option value="radiology">مركز أشعة</option><option value="rehab">تأهيل</option><option value="pharmacy">صيدلية</option><option value="elderly">رعاية كبار السن</option><option value="addiction">علاج الإدمان</option>
                  </select>
                </div>
                                <input placeholder="العنوان" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field" />
                <textarea placeholder="الخدمات والأسعار والمواعيد" value={formData.services} onChange={(e) => setFormData({ ...formData, services: e.target.value })} className="input-field" rows={4} />
                <textarea placeholder="الوثائق والتراخيص وأرقامها" value={formData.documents} onChange={(e) => setFormData({ ...formData, documents: e.target.value })} className="input-field" rows={3} />
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><label className="block text-sm font-bold text-gray-700 mb-2">إرفاق وثائق المؤسسة</label><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e=>setInstitutionFiles(Array.from(e.target.files||[]).map(f=>f.name))} className="block w-full text-sm"/><p className="mt-2 text-xs text-gray-500">يتم تسجيل أسماء الملفات مع طلب المؤسسة. التخزين الآمن الفعلي للملفات يحتاج مساحة تخزين خاصة بالمشروع.</p>{institutionFiles.length>0&&<div className="mt-2 text-xs text-teal-700">{institutionFiles.join(' · ')}</div>}</div>
                <textarea placeholder="جدول المواعيد وساعات العمل" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} className="input-field" rows={3} />
                {formData.institutionType === 'pharmacy' && <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 space-y-3"><label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={formData.deliveryEnabled} onChange={e=>setFormData({...formData,deliveryEnabled:e.target.checked})}/> أريد خدمة التوصيل</label>{formData.deliveryEnabled&&<><select value={formData.deliveryMethod} onChange={e=>setFormData({...formData,deliveryMethod:e.target.value})} className="input-field bg-white"><option value="platform">التوصيل من خلال SB1</option><option value="self">التوصيل بواسطة الصيدلية</option></select>{formData.deliveryMethod==='platform'&&<p className="text-sm text-orange-800">سيتم إنشاء حسابات مستقلة للعاملين في التوصيل واستقبال إشعارات الطلبات.</p>}</>}</div>}
              </>
            )}

            {(accountType === 'institution' || accountType === 'specialist' || accountType === 'delivery_worker') && <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900"><b>قواعد الخدمة والمخالفات:</b><p className="mt-1">يلتزم مقدم الخدمة بالمواعيد، صحة الوثائق، احترام العميل، حماية بياناته، والإبلاغ عن أي تعارض. التأخير أو الإلغاء غير المبرر أو الشكاوى المثبتة قد تؤدي إلى رسوم أو تعليق أو تصعيد وفق العقد والقانون.</p><a href="/contracts" className="inline-block mt-2 font-bold underline">قراءة العقود والتعهدات</a></div>}
            {accountType === 'client' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={formData.showName} onChange={() => setFormData({ ...formData, showName: true, anonymous: false })} className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-gray-700">{t('register.show_name')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={formData.anonymous} onChange={() => setFormData({ ...formData, showName: false, anonymous: true })} className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-gray-700">{t('register.anonymous')}</span>
                </label>
              </div>
            )}

            {accountType === 'specialist' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('register.specialty')}</label>
                  <select value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="input-field">
                    <option value="">{t('ask.select_specialty')}</option>
                    {specialties.map((s) => <option key={s.id} value={s.id}>{specialtyName(s)}</option>)}
                  </select>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    {t('register.documents')}
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'id', label: t('register.upload_id') },
                      { key: 'cert', label: t('register.upload_cert') },
                      { key: 'license', label: t('register.upload_license') },
                    ].map((doc) => (
                      <div key={doc.key}>
                        <label className="block text-sm text-gray-600 mb-1">{doc.label}</label>
                        <input
                          type="text"
                          placeholder="URL"
                          value={(docUrls as Record<string, string | undefined>)[doc.key] || ''}
                          onChange={(e) => setDocUrls({ ...docUrls, [doc.key]: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 mt-3 flex items-start gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {t('register.verify_note')}
                  </p>
                </div>
              </>
            )}

            <div className="rounded-2xl border bg-gray-50 p-4"><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="mt-1"/><span>أقر بقراءة قواعد SB1 والعقد الخاص بدوري، وبصحة بياناتي ووثائقي، وأوافق على معالجة الطلبات والشكاوى والعقوبات وفق الشروط والقانون المعمول به. <a href="/contracts" className="text-teal-700 font-bold underline">عرض العقود</a></span></label></div>
            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {submitting ? t('register.submitting') : t('register.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
