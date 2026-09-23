import { useState } from 'react';
import { Gift, Copy, Check, Users, DollarSign, Share2, TrendingUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function ReferralPage() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [points,setPoints] = useState(()=>Number(localStorage.getItem('sb1_reward_points')||'120'));
  const referralLink = 'https://sb1.vercel.app/ref/sb1';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { icon: Share2, text: t('referral.step1') },
    { icon: Users, text: t('referral.step2') },
    { icon: TrendingUp, text: t('referral.step3') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('referral.title')}</h1>
          <p className="text-gray-500">{t('referral.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <label className="block text-sm font-medium text-gray-600 mb-3">{t('referral.your_link')}</label>
          <div className="flex gap-3">
            <input readOnly value={referralLink} className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-sm" />
            <button onClick={copyLink} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors whitespace-nowrap">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('referral.copied') : t('referral.copy')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">0</p>
            <p className="text-sm text-gray-500">{t('referral.total_referrals')}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{points}</p>
            <p className="text-sm text-gray-500">نقاط المكافآت</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">{t('referral.how_it_works')}</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <p className="text-gray-600 text-sm">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
