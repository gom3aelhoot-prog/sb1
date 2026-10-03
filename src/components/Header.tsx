import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  User,
  HeartPulse,
  LogIn,
  UserPlus,
  Home,
  HelpCircle,
  Info,
  Phone,
  BookOpen,
  Stethoscope,
  Building2,
  Shield,
  ChevronDown,
  Wallet,
  ShoppingCart,
  Globe2,
  LockKeyhole,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';
import { useI18n } from '@/lib/i18n';
import { MegaMenu } from '@/components/MegaMenu';
import { LanguageSwitcher, MobileLanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationsPopover } from '@/components/NotificationsPopover';
import PrivateNotificationsPopover from '@/components/PrivateNotificationsPopover';
import { SPECIALTIES } from '@/types/i18n';
import SessionNavCounter from '@/components/SessionNavCounter';
import { getRole } from '@/lib/access';
import { supabase } from '@/lib/supabase';
import { COUNTRY_OPTIONS } from '@/types/i18n';

export function Header() {
  const { t, isAnonymous, setCountry } = useApp();
  const { t: platformT, lang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const role=getRole();
  const canSeePrivateHeader = role==='owner' || role==='moderator' || localStorage.getItem('sb1_is_page_owner')==='true';
  const isPrivate=(href:string)=>{if(['/dashboard'].includes(href))return ['client','owner'].includes(role);if(href.startsWith('/specialist'))return ['specialist','owner'].includes(role);if(href==='/delivery')return ['institution','delivery_worker','owner'].includes(role);if(href==='/complaints'||href==='/safety')return !['guest'].includes(role);if(href.startsWith('/owner')||href.startsWith('/admin'))return ['owner','moderator'].includes(role);return true};
  const [mobileSection, setMobileSection] = useState<'main' | 'specialties' | 'language'>('main');
  const [authOpen,setAuthOpen]=useState(false);
  const [authMode,setAuthMode]=useState<'login'|'signup'>('login');
  const [authEmail,setAuthEmail]=useState('');
  const [authPassword,setAuthPassword]=useState('');
  const [authCountry,setAuthCountry]=useState('EG');
  const [authBusy,setAuthBusy]=useState(false);
  const [authError,setAuthError]=useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const labels:any = { ar:['الأخصائيون والأطباء','المحتوى الطبي والمكتبة','المتجر','المكافآت'], en:['Specialists & Doctors','Medical Content & Library','Store','Rewards'], de:['Fachärzte & Ärzte','Medizinische Inhalte & Bibliothek','Facharzt-Shop','Belohnungen'], ru:['Специалисты и врачи','Медицинский контент и библиотека','Магазин','Награды'], uk:['Спеціалісти та лікарі','Медичний контент і бібліотека','Магазин спеціалістів','Нагороди'], uz:['Mutaxassislar va shifokorlar','Tibbiy kontent va kutubxona','Mutaxassislar do‘koni','Mukofotlar'], hy:['Մասնագետներ և բժիշկներ','Բժշկական բովանդակություն և գրադարան','Մասնագետների խանութ','Պարգևներ'], tg:['Мутахассисон ва табибон','Мундариҷаи тиббӣ ва китобхона','Дӯкони мутахассисон','Мукофотҳо'], az:['Mütəxəssislər və həkimlər','Tibbi məzmun və kitabxana','Mütəxəssis mağazası','Mükafatlar'], am:['ስፔሻሊስቶች እና ሐኪሞች','የሕክምና ይዘት እና ቤተ-መጽሐፍት','የስፔሻሊስቶች መደብር','ሽልማቶች'], ka:['სპეციალისტები და ექიმები','სამედიცინო კონტენტი და ბიბლიოთეკა','სპეციალისტების მაღაზია','ჯილდოები']}[lang] || ['Specialists & Doctors','Medical Content & Library','Store','Rewards'];
  const platformSections = [
    { label: lang==='ar'?'الأخصائيون والأطباء':lang==='ru'?'Специалисты и врачи':lang==='de'?'Fachärzte & Ärzte':'Specialists & Doctors', href: '/doctors' },
    { label: platformT('nav.questions'), href: '/questions' },
    { label: lang==='ar'?'جلسات الفيديو':lang==='ru'?'Видеосессии':lang==='de'?'Videositzungen':'Video Sessions', href: '/choose-doctor' },
    { label: lang==='ar'?'الجلسات المجانية':lang==='ru'?'Бесплатные сессии':lang==='de'?'Kostenlose Sitzungen':'Free Sessions', href: '/sessions' },
    { label: labels[1], href: '/media' },
    { label: platformT('nav.courses'), href: '/courses' },
    { label: lang==='ar'?'المرافق الطبية':lang==='ru'?'Медицинские учреждения':lang==='de'?'Medizinische Einrichtungen':'Medical Facilities', href: '/facilities' },
    { label: lang==='ar'?'الاختبارات الطبية والنفسية':lang==='ru'?'Медицинские и психологические тесты':lang==='de'?'Medizinische & psychologische Tests':'Medical & Psychological Tests', href: '/tests' },
    { label: lang==='ar'?'الألعاب والتطبيقات':lang==='ru'?'Игры и приложения':lang==='de'?'Spiele & Apps':'Games & Apps', href: '/apps' },
    { label: lang==='ar'?'المتجر':lang==='ru'?'Магазин':lang==='de'?'Shop':'Store', href: '/store' },
    { label: labels[3], href: '/referral' },
    ...[
      { label: lang==='ar'?'التوصيل والخرائط':'Delivery & Maps', href:'/delivery' },
      { label: lang==='ar'?'الشكاوى':'Complaints', href:'/complaints' },
      { label: lang==='ar'?'لوحة العميل':'Client Dashboard', href:'/dashboard' },
      { label: lang==='ar'?'استوديو الأخصائي':'Specialist Studio', href:'/specialist/studio' },
      { label: lang==='ar'?'مراجعة فحص الوجه':'Face Verification Review', href:'/admin/face-verification' },
      { label: lang==='ar'?'باقات المتابعة':'Long-term Packages', href:'/specialist/packages' },
    ].filter(item=>item.href==='/admin/face-verification' ? ['owner','moderator'].includes(role) : isPrivate(item.href))
  ];
  const navItems = [
    { label: t.nav.home, href: '/#home', icon: Home },
    { label: 'صفحتي', href: '/profile', icon: User },
    { label: t.nav.howItWorks, href: '/#how-it-works', icon: HelpCircle },
    { label: t.nav.about, href: '/#about', icon: Info },
    { label: t.nav.contact, href: '/#contact', icon: Phone },
  ];
  const submitAuth=async()=>{setAuthBusy(true);setAuthError('');try{const selected=COUNTRY_OPTIONS.find(x=>x.code===authCountry);if(selected)setCountry(selected);if(authMode==='signup'){const r=await supabase.auth.signUp({email:authEmail.trim().toLowerCase(),password:authPassword,options:{data:{country_code:authCountry,language_code:lang}}});if(r.error)throw r.error;}else{const r=await supabase.auth.signInWithPassword({email:authEmail.trim().toLowerCase(),password:authPassword});if(r.error)throw r.error;const u:any=r.data?.user;if(u?.user_metadata?.country_code){const saved=COUNTRY_OPTIONS.find(x=>x.code===u.user_metadata.country_code);if(saved)setCountry(saved)}}localStorage.setItem('sb1_country_code',authCountry);localStorage.setItem('sb1_account_email',authEmail.trim().toLowerCase());setAuthOpen(false);window.location.reload();}catch(e:any){setAuthError(e?.message||'تعذر تسجيل الدخول')}finally{setAuthBusy(false)}};

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass border-b border-neutral-200/80 shadow-sm shadow-neutral-900/5'
            : 'bg-white border-b border-neutral-100'
        }`}
      >
        <div className="container-x">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
            {/* Logo */}
            <a href="/#home" className="flex items-center gap-2.5 flex-shrink-0" onClick={() => setMobileOpen(false)}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-lg font-bold leading-tight text-neutral-900">SB1</span>
                
              </div>
            </a>

            {/* Desktop Nav: compact core links only; platform sections are in the full-width row below */}
            <nav className="hidden lg:flex min-w-0 items-center gap-0.5">
              <a href="/#home" title="الرئيسية" className="rounded-lg px-2 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100">{t.nav.home}</a>
              <a href="/profile" title="صفحتك الشخصية" className="rounded-lg bg-blue-600 px-2 py-2 text-xs font-bold text-white hover:bg-blue-700">صفحتي</a>
              <a href="/#how-it-works" className="rounded-lg px-2 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100">{t.nav.howItWorks}</a>
              <a href="/#about" className="rounded-lg px-2 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100">{t.nav.about}</a>
              <a href="/#contact" className="rounded-lg px-2 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100">{t.nav.contact}</a>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              {canSeePrivateHeader && <a href="/wallet" className="hidden sm:flex items-center gap-1.5 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-700 hover:bg-teal-100" title="المحفظة">
                <Wallet className="h-4 w-4" />
                <span className="hidden xl:inline">المحفظة</span>
              </a>}
              <a href="/cart" className="group relative flex min-w-10 flex-col items-center justify-center rounded-xl px-1 py-1 text-neutral-700 hover:bg-neutral-100" title="سلة المشتريات">
                <ShoppingCart className="h-5 w-5" />
                <span className="mt-0.5 text-[9px] font-bold leading-none text-neutral-500">{lang==='ar'?'سلة المشتريات':lang==='ru'?'Корзина':lang==='de'?'Warenkorb':'Cart'}</span>
              </a>

              {canSeePrivateHeader && <><a href="/notifications/global" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-sky-700 hover:bg-sky-50" title="الإشعارات العامة"><Globe2 className="h-5 w-5"/></a><PrivateNotificationsPopover /></>}

              {/* Auth buttons */}
              <div className="hidden md:flex items-center gap-2">
                {isAnonymous && (
                  <>
                    <button onClick={()=>{setAuthMode('login');setAuthOpen(true);setAuthError('')}} className="btn-ghost text-sm" >
                      <LogIn className="h-4 w-4" />
                      {t.nav.signIn}
                    </button>
                    <button onClick={()=>{window.location.href='/register'}} className="btn-primary text-sm" >
                      <UserPlus className="h-4 w-4" />
                      {t.nav.signUp}
                    </button>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {authOpen&&<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/50 p-4" dir={lang==='ar'?'rtl':'ltr'}><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-extrabold">{authMode==='login'?(lang==='ar'?'تسجيل الدخول':'Sign in'):(lang==='ar'?'إنشاء حساب':'Create account')}</h2><p className="mt-1 text-sm text-gray-500">{lang==='ar'?'اختر الدولة لتحديد محتوى وخدمات بلدك.':'Choose your country for country-specific content and services.'}</p></div><button onClick={()=>setAuthOpen(false)} className="rounded-xl p-2 hover:bg-gray-100"><X className="h-5 w-5"/></button></div><div className="mt-5 space-y-3"><select value={authCountry} onChange={e=>setAuthCountry(e.target.value)} className="input-field bg-white">{COUNTRY_OPTIONS.map(x=><option key={x.code} value={x.code}>{x.flag} {(()=>{try{return new Intl.DisplayNames([lang],{type:'region'}).of(x.code)||x.nameKey}catch{return x.nameKey}})()}</option>)}</select><input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder={lang==='ar'?'البريد الإلكتروني':'Email'} className="input-field"/><input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder={lang==='ar'?'كلمة المرور':'Password'} className="input-field"/>{authError&&<div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{authError}</div>}<button disabled={authBusy} onClick={submitAuth} className="btn-primary w-full">{authBusy?'...':authMode==='login'?(lang==='ar'?'دخول':'Sign in'):(lang==='ar'?'إنشاء الحساب':'Create account')}</button><button onClick={()=>{setAuthMode(authMode==='login'?'signup':'login');setAuthError('')}} className="w-full text-sm font-bold text-teal-700">{authMode==='login'?(lang==='ar'?'ليس لديك حساب؟ إنشاء حساب':'Create an account'):(lang==='ar'?'لديك حساب؟ تسجيل الدخول':'Sign in instead')}</button></div></div></div>}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => {
              setMobileOpen(false);
              setMobileSection('main');
            }}
          />
          <div className="absolute end-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-slide-down overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                  <HeartPulse className="h-4.5 w-4.5" />
                </div>
                <span className="font-bold text-neutral-900">SB1</span>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSection('main');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mobileSection === 'main' && (
              <div className="p-4 space-y-1">
                {/* Nav links */}
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-4.5 w-4.5 text-neutral-400" />
                    {item.label}
                  </a>
                ))}

                {/* Main platform sections */}
                <div className="my-3 border-y border-neutral-100 py-2">
                  <p className="px-3 pb-2 text-xs font-bold text-neutral-400">أقسام المنصة</p>
                  {platformSections.map((item) => (
                    <a key={item.href} href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700">
                      {item.label}
                    </a>
                  ))}
                </div>

                {/* Specialties */}
                <a href="/specialties" onClick={()=>setMobileOpen(false)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"><span className="flex items-center gap-3"><Shield className="h-4.5 w-4.5 text-neutral-400"/>{t.nav.specialties}</span><ChevronDown className="h-4 w-4 text-neutral-400"/></a>

                {/* Language */}
                <button
                  onClick={() => setMobileSection('language')}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <span className="flex items-center gap-3">
                    <User className="h-4.5 w-4.5 text-neutral-400" />
                    {t.language.selectLanguage}
                  </span>
                  <ChevronDown className="h-4 w-4 rotate-[-90deg] text-neutral-400" />
                </button>

                {/* Auth */}
                <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
                  {isAnonymous && (
                    <>
                      <button
                        className="btn-ghost w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileOpen(false);
                        }}
                      >
                        <LogIn className="h-4 w-4" />
                        {t.nav.signIn}
                      </button>
                      <button
                        className="btn-primary w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileOpen(false);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                        {t.nav.signUp}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {mobileSection === 'specialties' && (
              <div className="p-4">
                <button
                  onClick={() => setMobileSection('main')}
                  className="mb-4 flex items-center gap-2 text-sm font-medium text-primary-600"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  {t.nav.specialties}
                </button>
                <div className="space-y-4">
                  {SPECIALTIES.map((cat) => (
                    <div key={cat.key}>
                      <h3 className="mb-2 text-sm font-bold text-neutral-900 px-1">
                        {t.mega[cat.key as keyof typeof t.mega] as string}
                      </h3>
                      <div className="space-y-1">
                        {cat.items.map((item) => (
                          <a
                            key={item.key}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setMobileOpen(false);
                              setMobileSection('main');
                            }}
                            className="block rounded-lg px-3 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700"
                          >
                            {t.mega.sub[item.key]}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mobileSection === 'language' && (
              <div className="p-4">
                <button
                  onClick={() => setMobileSection('main')}
                  className="mb-4 flex items-center gap-2 text-sm font-medium text-primary-600"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  {t.language.selectLanguage}
                </button>
                <MobileLanguageSwitcher
                  onClose={() => {
                    setMobileOpen(false);
                    setMobileSection('main');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
