import { useEffect, useState } from 'react';
import { Star, MapPin, Clock, MessageCircle, Calendar, Stethoscope, BadgeCheck, Bot } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import type { Doctor } from '@/lib/supabase';
import { localizedField } from '@/lib/localizedContent';

export default function DoctorCard({ doctor, directory = false }: { doctor: Doctor; directory?: boolean }) {
  const { navigate } = useRouter();
  const { specialtyName, t, lang, dir } = useI18n();
  const [imgError, setImgError] = useState(false);
  const fallbackAvatar = `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(doctor.id || doctor.name)}`;
  const [imgSrc, setImgSrc] = useState(doctor.photo_url || fallbackAvatar);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setImgSrc(doctor.photo_url || fallbackAvatar);
    setImgError(false);
  }, [doctor.photo_url]);

  const name = localizedField(doctor as unknown as Record<string, unknown>, 'name', lang, doctor.name);
  const bio = localizedField(doctor as unknown as Record<string, unknown>, 'bio', lang, doctor.bio);
  const city = localizedField(doctor as unknown as Record<string, unknown>, 'city', lang, doctor.city);

  const expLabel: any = { ar:'سنة', en:'yrs', de:'Jahre', ru:'лет', uk:'років', uz:'yil', hy:'տարի', tg:'сол', az:'il', am:'ዓመት', ka:'წელი' }[lang] || 'yrs';
  const consultLabel: any = { ar:'استشارة', en:'consults', de:'Beratungen', ru:'консультаций', uk:'консультацій', uz:'maslahat', hy:'խորհրդատվություն', tg:'машварат', az:'məsləhət', am:'ምክክር', ka:'კონსულტაცია' }[lang] || 'consults';
  const virtualLabel: any = { ar:'افتراضي', en:'Virtual', de:'Virtuell', ru:'Виртуальный', uk:'Віртуальний', uz:'Virtual', hy:'Վիրտուալ', tg:'Виртуалӣ', az:'Virtual', am:'ምናባዊ', ka:'ვირტუალური' }[lang] || 'Virtual';
  const fullProfileLabel: any = { ar:'عرض الصفحة الكاملة', en:'View full profile', de:'Profil öffnen', ru:'Открыть профиль', uk:'Відкрити профіль', uz:'To‘liq profil', hy:'Դիտել ամբողջական էջը', tg:'Кушодани профил', az:'Tam profili aç', am:'ሙሉ መገለጫ', ka:'სრული პროფილის ნახვა' }[lang] || 'View full profile';
  const sessionLabel: any = { ar:'طلب جلسة', en:'Session', de:'Sitzung', ru:'Сессия', uk:'Сесія', uz:'Sessiya', hy:'Նիստ', tg:'Ҷаласа', az:'Sessiya', am:'ክፍለ ጊዜ', ka:'სესია' }[lang] || 'Session';
  const askLabel: any = { ar:'طلب استشارة', en:'Ask a doctor', de:'Arzt fragen', ru:'Задать вопрос врачу', uk:'Запитати лікаря', uz:'Shifokordan so‘rash', hy:'Հարցնել բժշկին', tg:'Аз духтур пурсед', az:'Həkimdən soruş', am:'ሐኪምን ይጠይቁ', ka:'ჰკითხეთ ექიმს' }[lang] || 'Ask a doctor';

  const handleConsult = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(doctor.is_virtual
      ? `/ask?specialty=${doctor.specialty?.slug || ''}&virtual=1`
      : `/ask?specialty=${doctor.specialty?.slug || ''}&doctor=${doctor.id}`);
  };

  const handleSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/sessions?doctor=${doctor.id}&specialty=${doctor.specialty?.slug || ''}`);
  };

  if (directory) {
    return (
      <div onClick={() => navigate(`/doctors/${doctor.id}`)} className="relative w-full cursor-pointer rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" dir={dir}>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-gray-100 ring-2 ring-blue-100">
              {!imgError && imgSrc ? <img src={imgSrc} alt={name} className="h-full w-full object-cover" onError={() => { if (imgSrc !== fallbackAvatar) setImgSrc(fallbackAvatar); else setImgError(true); }} /> : <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-blue-700">{name.replace(/^د\\. |^(Dr\\. |Доктор |Դոկտոր |დოქტორი )/,'').charAt(0)}</span>}
            </div>
            <span className={"absolute -bottom-1 -start-1 h-5 w-5 rounded-full border-2 border-white "+(doctor.is_online?'bg-emerald-500':'bg-gray-400')} title={doctor.is_online?'Online':'Offline'} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold text-gray-900">{name}</h3>
              {doctor.is_verified && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700"><BadgeCheck className="inline h-3.5 w-3.5" /> موثق</span>}
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">الأكثر تقييماً</span>
            </div>
            {doctor.specialty && <p className="mt-1 font-medium text-blue-700">{specialtyName(doctor.specialty)}</p>}
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">{bio}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-gray-50 p-2"><b className="block text-base text-gray-900">{(doctor.follower_count||0).toLocaleString()}</b><span className="text-xs text-gray-400">متابع</span></div>
              <div className="rounded-xl bg-gray-50 p-2"><b className="block text-base text-gray-900">{(doctor.consultation_count||0).toLocaleString()}</b><span className="text-xs text-gray-400">إجابة</span></div>
              <div className="rounded-xl bg-gray-50 p-2"><b className="block text-base text-gray-900">{(doctor.follower_count ? (doctor.follower_count/10).toFixed(1)+'k' : '3.9k')}</b><span className="text-xs text-gray-400">السمعة</span></div>
            </div>
            <div className="mt-3 flex items-center justify-between"><span className="text-xl font-extrabold text-emerald-700">{'75'} <small className="text-xs font-normal text-gray-400">ر.س/شهر</small></span><span className="text-xs text-gray-400"><Star className="inline h-3 w-3 fill-amber-400 text-amber-400" /> {Number(doctor.rating).toFixed(1)}</span></div>
            <div className="mt-2 flex items-center gap-2 text-xs"><span className={doctor.is_online?'text-emerald-600':'text-gray-400'}><span className={"me-1 inline-block h-2 w-2 rounded-full "+(doctor.is_online?'bg-emerald-500':'bg-gray-400')} />{doctor.is_online?'متصل الآن':'غير متصل'}</span></div><div className="mt-3 flex gap-2">
              <button onClick={handleSession} className="flex-1 rounded-xl border py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"><Calendar className="inline h-4 w-4" /> حجز جلسة</button>
              <button onClick={handleConsult} className="flex-1 rounded-xl bg-blue-700 py-2.5 text-sm font-bold text-white hover:bg-blue-800"><MessageCircle className="inline h-4 w-4" /> متابعة</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/doctors/${doctor.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card card-hover relative flex w-full cursor-pointer flex-col items-center p-5 text-start"
      dir={dir}
    >
      {hovered && (
        <div className="card absolute end-0 top-full z-20 mt-2 w-64 p-4 shadow-xl animate-fade-in">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-sm font-bold text-gray-800">{name}</p>
            {doctor.is_verified && <BadgeCheck className="h-4 w-4 text-blue-600" />}
            {doctor.is_virtual && <span className="badge bg-purple-100 text-purple-600 text-[10px]">{virtualLabel}</span>}
          </div>
          {doctor.specialty && <p className="mb-2 text-xs text-blue-700">{specialtyName(doctor.specialty)}</p>}
          {bio && <p className="mb-2 line-clamp-3 text-xs text-gray-500">{bio}</p>}
          <div className="space-y-1 text-xs text-gray-500">
            {city && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{city}</p>}
            <p className="flex items-center gap-1"><Clock className="h-3 w-3" />{doctor.experience_years} {expLabel}</p>
            <p className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{doctor.consultation_count} {consultLabel}</p>
            {doctor.phone_number && !doctor.is_virtual && <p className="flex items-center gap-1 text-teal-600"><Stethoscope className="h-3 w-3" />{doctor.phone_number}</p>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/doctors/${doctor.id}`); }} className="mt-2 text-xs font-medium text-teal-600 hover:text-blue-700">
            {fullProfileLabel}
          </button>
        </div>
      )}

      <div className="relative mb-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 via-white to-green-50 ring-2 ring-blue-100 transition-all group-hover:ring-blue-300">
          {!imgError && imgSrc ? (
            <img src={imgSrc} alt={name} className="h-full w-full object-cover" onError={() => { if (imgSrc !== fallbackAvatar) setImgSrc(fallbackAvatar); else setImgError(true); }} />
          ) : doctor.is_virtual ? (
            <Bot className="h-10 w-10 text-teal-600" />
          ) : (
            <span className="text-3xl font-bold text-teal-600">{name.replace('د. ', '').charAt(0)}</span>
          )}
        </div>
        <div className={"absolute -bottom-1 -start-1 flex items-center gap-1 rounded-full px-2 py-0.5 shadow-sm "+(doctor.is_online?'bg-emerald-500':'bg-gray-400')}><span className="text-[10px] font-bold text-white">{doctor.is_online?'متصل':'غير متصل'}</span></div><div className="absolute -bottom-1 -start-1 translate-y-5 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 shadow-sm">
          <Star className="h-3 w-3 fill-white text-white" />
          <span className="text-xs font-bold text-white">{Number(doctor.rating).toFixed(1)}</span>
        </div>
        {doctor.is_virtual && <div className="absolute -end-1 -top-1 rounded-full bg-purple-500 p-1 shadow-sm"><Bot className="h-3.5 w-3.5 text-white" /></div>}
      </div>

      <h3 className="flex items-center gap-1.5 text-lg font-bold text-gray-800 transition-colors group-hover:text-teal-600">
        {name}{doctor.is_verified && <BadgeCheck className="h-4 w-4 text-teal-500" />}
      </h3>
      {doctor.specialty && <p className="mt-1 text-sm font-medium text-teal-600">{specialtyName(doctor.specialty)}</p>}
      <p className="mt-1 line-clamp-2 text-center text-xs text-gray-400">{bio}</p>
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{doctor.experience_years} {expLabel}</span>
        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{doctor.consultation_count}</span>
      </div>

      <div className="mt-4 flex w-full gap-2">
        <button onClick={handleConsult} className="flex-1 rounded-xl bg-blue-700 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-800">
          <MessageCircle className="mx-auto inline h-3.5 w-3.5" /> <span className="ms-1">{askLabel}</span>
        </button>
        <button onClick={doctor.is_virtual ? (e)=>e.stopPropagation() : handleSession} disabled={false} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60">
          <Calendar className="mx-auto inline h-3.5 w-3.5" /> <span className="ms-1">{sessionLabel}</span>
        </button>
      </div>
    </div>
  );
}
