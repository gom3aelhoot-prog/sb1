import { useEffect, useState } from 'react';
import { Check, Crown, Sparkles, TrendingUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type SubscriptionPlan } from '@/lib/supabase';
import { useRouter } from '@/lib/router';

export default function SubscriptionsPage() {
  const { t, lang } = useI18n();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useRouter();

  useEffect(() => { getCountryServicePrice(country,'subscription').then(p=>setSubscriptionPrice(p.local_price)); }, [country.code]);

  useEffect(() => {
    supabase.from('subscription_plans').select('*').eq('is_active', true).order('duration_months').then(({ data }) => {
      setPlans((data && data.length ? data : [
        { id:'sub-free', name:'Free', name_ar:'مجاني', duration_months:1, price:0, daily_questions_limit:1, weekly_questions_limit:3, free_courses_limit:0, free_books_limit:1, features:'سؤال مجاني، مكتبة أساسية', is_active:true, created_at:new Date().toISOString() },
        { id:'sub-plus', name:'Plus', name_ar:'بلس', duration_months:1, price:9.99, daily_questions_limit:3, weekly_questions_limit:10, free_courses_limit:1, free_books_limit:5, features:'أسئلة أكثر، كتب ودورات مخفضة', is_active:true, created_at:new Date().toISOString() },
        { id:'sub-pro', name:'Pro', name_ar:'احترافي', duration_months:1, price:24.99, daily_questions_limit:10, weekly_questions_limit:30, free_courses_limit:3, free_books_limit:20, features:'أولوية، مكتبة كاملة، خصومات', is_active:true, created_at:new Date().toISOString() },
      ]) as SubscriptionPlan[]);
      setLoading(false);
    });
  }, []);

  const planIcons = [Sparkles, TrendingUp, Crown, Crown];
  const planColors = ['teal', 'blue', 'amber', 'purple'];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">{t('subs.title')}</h1>
        <p className="text-gray-500 text-center mb-10">{t('subs.subtitle')}</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-8 animate-pulse">
                <div className="h-12 w-12 bg-gray-100 rounded-xl mb-4" />
                <div className="h-6 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => {
              const Icon = planIcons[i] || Sparkles;
              const color = planColors[i] || 'teal';
              const features = (plan.features || '').split('،').filter(Boolean);
              return (
                <div key={plan.id} className={`card p-8 relative overflow-hidden ${i === 1 ? 'ring-2 ring-teal-500' : ''}`}>
                  {i === 1 && (
                    <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      {lang === 'ar' ? 'الأكثر شعبية' : 'Popular'}
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl bg-${color}-100 flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 text-${color}-600`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{plan.name_ar || plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-gray-800">{plan.price===0?'0':subscriptionPrice.toLocaleString(lang==='ar'?'ar-EG':'en-US')}</span>
                    <span className="text-sm text-gray-400">{t('subs.per_month')}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span>{f.trim()}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate(plan.price === 0 ? '/register' : `/payments?type=subscription&plan=${plan.id}&amount=${plan.price===0?0:subscriptionPrice}`)} className={`btn-primary w-full ${i !== 1 ? 'btn-secondary' : ''}`}>
                    {t('subs.choose')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
