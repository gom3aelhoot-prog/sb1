import { useState } from 'react';
import { User, Stethoscope, Upload, Check, FileText, Shield, UserCircle, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { supabase, type Specialty } from '@/lib/supabase';
import { useEffect } from 'react';

export default function RegisterPage() {
  const { t, specialtyName } = useI18n();
  const { navigate } = useRouter();
  const [accountType, setAccountType] = useState<'client' | 'specialist' | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', specialty: '',
    showName: true, anonymous: false,
  });
  const [docUrls, setDocUrls] = useState<{ id?: string; cert?: string; license?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.from('specialties').select('*').order('name').then(({ data }) => setSpecialties(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (accountType === 'client') {
        const { error } = await supabase.from('doctors').insert({
          name: formData.anonymous ? 'مجهول' : formData.name,
          specialty_id: null,
          bio: 'عميل',
          education: '',
          experience_years: 0,
          photo_url: '',
          city: '',
          native_language: 'ar',
          is_verified: false,
          phone_number: formData.phone,
        });
        if (!error) setSuccess(true);
      } else if (accountType === 'specialist') {
        const { data, error } = await supabase.from('doctors').insert({
          name: formData.name,
          specialty_id: formData.specialty || null,
          bio: '',
          education: '',
          experience_years: 0,
          photo_url: '',
          city: '',
          native_language: 'ar',
          is_verified: false,
          phone_number: formData.phone,
        }).select().single();
        if (!error && data) {
          if (docUrls.id) await supabase.from('specialist_documents').insert({ doctor_id: data.id, doc_type: 'id', doc_url: docUrls.id });
          if (docUrls.cert) await supabase.from('specialist_documents').insert({ doctor_id: data.id, doc_type: 'certificate', doc_url: docUrls.cert });
          if (docUrls.license) await supabase.from('specialist_documents').insert({ doctor_id: data.id, doc_type: 'license', doc_url: docUrls.license });
          setSuccess(true);
        }
      }
    } catch { /* ignore */ }
    setSubmitting(false);
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
            <p className="text-sm text-gray-500 mb-4">{t('register.verify_note')}</p>
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
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <button type="button" onClick={() => setAccountType(null)} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
              <ArrowRight className="w-4 h-4 rotate-180" />
              {t('common.back')}
            </button>

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

            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {submitting ? t('register.submitting') : t('register.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
