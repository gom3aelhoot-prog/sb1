import { useEffect, useState } from 'react';
import { Check, Crown, Sparkles, TrendingUp, Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type SubscriptionPlan } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { getCountryServicePrice } from '@/lib/countryPricing';
import { useApp } from '@/i18n/AppContext';

export default function SubscriptionsPage() {
  const { t, lang } = useI18n();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { country } = useApp();
  const [subscriptionPrice, setSubscriptionPrice] = useState(9.99);
  const { navigate } = useRouter();

  useEffect(() => { getCountryServicePrice(country,'subscription').then(p=>setSubscriptionPrice(p.local_price)); }, [country.code]);

  useEffect(() => {
    supabase.from('subscription_plans').select('*').eq('is_active', true).order('duration_months').then(({ data }) => {
      const fallback:any[]=[
        {id:'monthly',name:'Monthly',name_ar:'شهري',duration_months:1,price:9.99,features:'3 أسئلة يومياً، 1 كتاب، 1 ندوة، 1 دورة، 60 دقيقة فيديو'},
        {id:'quarterly',name:'Quarterly',name_ar:'3 أشهر',duration_months:3,price:24.99,features:'5 أسئلة يومياً، 3 كتب، 3 ندوات، دورتان، 180 دقيقة فيديو'},
        {id:'yearly',name:'Yearly',name_ar:'سنوي',duration_months:12,price:79.99,features:'12 سؤالاً يومياً، 12 كتاباً، 12 ندوة، 8 دورات، 720 دقيقة فيديو'}
      ];
      setPlans((data && data.length ? data : fallback) as SubscriptionPlan[]);setLoading(false);
    });
  }, []);

  const planIcons = [Sparkles, TrendingUp, Crown, Crown];
  const planColors = ['teal', 'blue', 'amber', 'purple'];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">{t('subs.title')}</h1>
        <p className="text-gray-500 text-center mb-4">{t('subs.subtitle')}</p><div className="mx-auto mb-8 max-w-4xl rounded-2xl border border-teal-100 bg-teal-50 p-5 text-sm leading-7 text-teal-900"><b className="block text-base">هذه الباقات مخصصة لحسابات العميل / المريض.</b><span>تشمل استخدام الخدمات الرقمية وفق حدود كل باقة مثل الأسئلة والمحتوى والدورات والجلسات. لا تعني الباقة اعتماد الطبيب أو المؤسسة، ولا تمنح صلاحيات إدارية.</span><div className="mt-2 text-gray-700">حساب الأخصائي له باقات وخدمات مهنية مستقلة، وحساب المؤسسة له إعدادات وخدمات مؤسسية مستقلة.</div></div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i=><div key={i} className="card p-5 animate-pulse"><div className="h-8 bg-gray-100 rounded w-1/2 mb-3"/><div className="h-4 bg-gray-100 rounded w-full mb-2"/><div className="h-4 bg-gray-100 rounded w-3/4"/></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.slice(0,3).map((plan, i) => {
              const Icon = [Sparkles, TrendingUp, Crown][i];
              const features = (plan.features || '').split('،').filter(Boolean);
              const displayPrice = Number(plan.price||0);
              return <div key={plan.id} className="card p-5 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Icon className="w-6 h-6 text-teal-600"/><h3 className="text-lg font-bold text-gray-800">{plan.name_ar || plan.name}</h3></div><div className="mt-2 text-2xl font-black text-gray-800">{displayPrice===0?'0':displayPrice.toLocaleString(lang==='ar'?'ar-EG':'en-US')} {country.currencySymbol}</div><div className="text-xs text-gray-400">{plan.duration_months===1?'شهرياً':`كل ${plan.duration_months} أشهر`}</div></div></div>
                <p className="mt-3 text-sm leading-6 text-gray-600">{features.slice(0,3).join(' · ')}</p><div className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-6 text-blue-900"><b>لمن؟</b> عميل / مريض. <br/><b>الاستخدام:</b> أسئلة ومحتوى ودورات وخدمات المريض حسب حدود الباقة.</div>
                <details className="mt-3 rounded-xl bg-gray-50 p-3"><summary className="cursor-pointer text-sm font-bold text-teal-700"><Info className="inline h-4 w-4 me-1"/>تفاصيل الباقة</summary><ul className="mt-3 space-y-2">{features.map((f,fi)=><li key={fi} className="flex items-start gap-2 text-xs text-gray-600"><Check className="w-4 h-4 text-teal-500 flex-shrink-0"/><span>{f.trim()}</span></li>)}</ul></details>
                <button onClick={() => navigate(plan.price === 0 ? '/register' : `/payments?type=subscription&plan=${plan.id}&amount=${displayPrice}`)} className="btn-primary w-full mt-4 py-2.5">{t('subs.choose')}</button>
              </div>;
            })}
          </div>
        )}      </div>
    </div>
  );
}
