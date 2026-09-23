import { useEffect, useState } from 'react';
import { Star, MapPin, Clock, MessageCircle, Calendar, Stethoscope, BadgeCheck, Bot } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import type { Doctor } from '@/lib/supabase';
import { localizedField } from '@/lib/localizedContent';

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  const { navigate } = useRouter();
  const { specialtyName, t, lang, dir } = useI18n();
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(doctor.photo_url);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setImgSrc(doctor.photo_url);
    setImgError(false);
  }, [doctor.photo_url]);

  const name = localizedField(doctor as unknown as Record<string, unknown>, 'name', lang, doctor.name);
  const bio = localizedField(doctor as unknown as Record<string, unknown>, 'bio', lang, doctor.bio);
  const city = localizedField(doctor as unknown as Record<string, unknown>, 'city', lang, doctor.city);

  const expLabel = {
    ar: 'سنة', ru: 'лет', de: 'Jahre', en: 'yrs'
  }[lang] || 'yrs';
  const consultLabel = {
    ar: 'استشارة', ru: 'консультаций', de: 'Beratungen', en: 'consults'
  }[lang] || 'consults';
  const virtualLabel = {
    ar: 'افتراضي', ru: 'Виртуальный', de: 'Virtuell', en: 'Virtual'
  }[lang] || 'Virtual';
  const fullProfileLabel = {
    ar: 'عرض الصفحة الكاملة', ru: 'Открыть профиль', de: 'Profil öffnen', en: 'View full profile'
  }[lang] || 'View full profile';
  const sessionLabel = {
    ar: 'طلب جلسة', ru: 'Сессия', de: 'Sitzung', en: 'Session'
  }[lang] || 'Session';

  const handleConsult = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(doctor.is_virtual
      ? `/ask?specialty=${doctor.specialty?.slug || ''}&virtual=1`
      : `/ask?specialty=${doctor.specialty?.slug || ''}&doctor=${doctor.id}`);
  };

  const handleSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/sessions?doctor=${doctor.id}`);
  };

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
            {doctor.is_verified && <BadgeCheck className="h-4 w-4 text-teal-500" />}
            {doctor.is_virtual && <span className="badge bg-purple-100 text-purple-600 text-[10px]">{virtualLabel}</span>}
          </div>
          {doctor.specialty && <p className="mb-2 text-xs text-teal-600">{specialtyName(doctor.specialty)}</p>}
          {bio && <p className="mb-2 line-clamp-3 text-xs text-gray-500">{bio}</p>}
          <div className="space-y-1 text-xs text-gray-500">
            {city && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{city}</p>}
            <p className="flex items-center gap-1"><Clock className="h-3 w-3" />{doctor.experience_years} {expLabel}</p>
            <p className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{doctor.consultation_count} {consultLabel}</p>
            {doctor.phone_number && !doctor.is_virtual && <p className="flex items-center gap-1 text-teal-600"><Stethoscope className="h-3 w-3" />{doctor.phone_number}</p>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/doctors/${doctor.id}`); }} className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700">
            {fullProfileLabel}
          </button>
        </div>
      )}

      <div className="relative mb-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 ring-2 ring-teal-100 transition-all group-hover:ring-teal-300">
          {!imgError && imgSrc ? (
            <img src={imgSrc} alt={name} className="h-full w-full object-cover" onError={() => setImgError(true)} />
          ) : doctor.is_virtual ? (
            <Bot className="h-10 w-10 text-teal-600" />
          ) : (
            <span className="text-3xl font-bold text-teal-600">{name.replace('د. ', '').charAt(0)}</span>
          )}
        </div>
        <div className="absolute -bottom-1 -start-1 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 shadow-sm">
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
        <button onClick={handleConsult} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700">
          <MessageCircle className="mx-auto inline h-3.5 w-3.5" /> <span className="ms-1">{lang === 'ar' ? 'طلب استشارة' : 'Ask a doctor'}</span>
        </button>
        <button onClick={doctor.is_virtual ? (e)=>e.stopPropagation() : handleSession} disabled={doctor.is_virtual} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60">
          <Calendar className="mx-auto inline h-3.5 w-3.5" /> <span className="ms-1">{doctor.is_virtual ? (lang==='ar'?'غير متاح':lang==='ru'?'Недоступно':'Unavailable') : sessionLabel}</span>
        </button>
      </div>
    </div>
  );
}
