import { useEffect, useState } from 'react';
import { Menu, X, Stethoscope, Phone, ChevronDown, Users, GraduationCap, UserRound, ClipboardCheck, Bot, CreditCard, Layers3 } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { lt } from '@/lib/featureText';

export default function Navbar() {
  const { path, navigate } = useRouter();
  const { t, lang } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const mainLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.doctors'), path: '/doctors' },
    { label: t('nav.ask'), path: '/ask' },
    { label: t('nav.questions'), path: '/questions' },
    { label: t('nav.articles'), path: '/articles' },
  ];

  const moreLinks = [
    { label: lt(lang,{ar:'المجتمع',ru:'Сообщество',en:'Community',de:'Community'}), path:'/community', icon: Users },
    { label: lt(lang,{ar:'الملف الشخصي',ru:'Профиль',en:'Profile',de:'Profil'}), path:'/profile', icon: UserRound },
    { label: lt(lang,{ar:'أكاديمية SB1',ru:'Академия SB1',en:'SB1 Academy',de:'SB1 Akademie'}), path:'/academy', icon: GraduationCap },
    { label: lt(lang,{ar:'التخصصات',ru:'Направления',en:'Specialties',de:'Fachgebiete'}), path:'/specialties', icon: Layers3 },
    { label: lt(lang,{ar:'الامتحانات التدريبية',ru:'Тренировочные экзамены',en:'Practice Exams',de:'Übungsprüfungen'}), path:'/exams', icon: ClipboardCheck },
    { label: lt(lang,{ar:'المساعدون الأذكياء',ru:'Умные помощники',en:'Smart Assistants',de:'Smart-Assistenten'}), path:'/assistants', icon: Bot },
    { label: lt(lang,{ar:'الدفع لمرة واحدة',ru:'Разовая оплата',en:'One-time Payments',de:'Einmalzahlung'}), path:'/payments', icon: CreditCard },
    { label: t('nav.videos'), path: '/videos' },
    { label: t('nav.audio'), path: '/audio' },
    { label: t('nav.courses'), path: '/courses' },
    { label: t('nav.sessions'), path: '/sessions' },
    { label: t('nav.chat'), path: '/chat' },
    { label: t('nav.library'), path: '/library' },
    { label: t('nav.planner'), path: '/planner' },
    { label: t('nav.clinics'), path: '/clinics' },
    { label: t('nav.radiology'), path: '/radiology' },
    { label: t('nav.labs'), path: '/labs' },
    { label: t('nav.tests'), path: '/tests' },
    { label: t('nav.facilities'), path: '/facilities' },
    { label: t('nav.jobs'), path: '/jobs' },
    { label: t('nav.ai_reader'), path: '/ai-reader' },
    { label: t('nav.favorites'), path: '/favorites' },
    { label: t('nav.referral'), path: '/referral' },
    { label: t('nav.subscriptions'), path: '/subscriptions' },
    { label: t('nav.register'), path: '/register' },
    { label: t('nav.policy'), path: '/policy' },
    { label: t('nav.admin'), path: '/admin' },
  ];

  const moreLabel = lt(lang,{ar:'المزيد',ru:'Ещё',en:'More',de:'Mehr'});

  const isActive = (linkPath: string) => linkPath === '/' ? path === '/' : path.startsWith(linkPath);
  const handleNavigate = (to: string) => { navigate(to); setMobileOpen(false); setMoreOpen(false); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-white/80 backdrop-blur-sm py-3'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => handleNavigate('/')} className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"><Stethoscope className="w-6 h-6 text-white" /></div>
            <div className="text-right"><span className="block text-lg font-extrabold tracking-tight text-gray-800">SB1</span><span className="block text-[10px] text-teal-600 font-medium">Smart Bridge One</span></div>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => <button key={link.path} onClick={() => handleNavigate(link.path)} className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${isActive(link.path) ? 'text-teal-700 bg-teal-50' : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'}`}>{link.label}</button>)}
            <div className="relative">
              <button onClick={() => setMoreOpen(!moreOpen)} className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm text-gray-600 hover:text-teal-600 hover:bg-gray-50"><span>{moreLabel}</span><ChevronDown className="w-4 h-4" /></button>
              {moreOpen && <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-72 max-h-[70vh] overflow-y-auto">
                {moreLinks.map((link) => <button key={link.path} onClick={() => handleNavigate(link.path)} className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-right ${isActive(link.path) ? 'text-teal-700 bg-teal-50' : 'text-gray-600 hover:bg-gray-50'}`}>{link.icon ? <link.icon className="w-4 h-4 shrink-0"/> : null}<span className="truncate">{link.label}</span></button>)}
              </div>}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0"><LanguageSwitcher /><button onClick={() => handleNavigate('/ask')} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition"><Phone className="w-4 h-4"/><span>{t('hero.ask_now')}</span></button></div>

          <div className="flex items-center gap-2 md:hidden"><LanguageSwitcher /><button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100">{mobileOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}</button></div>
        </div>
        {mobileOpen && <div className="md:hidden mt-3 pb-3"><div className="flex flex-col gap-1 bg-gray-50 rounded-2xl p-3 max-h-[75vh] overflow-y-auto">{[...mainLinks,...moreLinks].map((link) => <button key={link.path} onClick={() => handleNavigate(link.path)} className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm text-right ${isActive(link.path) ? 'text-teal-700 bg-teal-50' : 'text-gray-600 hover:bg-white'}`}>{link.icon ? <link.icon className="w-4 h-4"/> : null}{link.label}</button>)}</div></div>}
      </div>
    </nav>
  );
}
