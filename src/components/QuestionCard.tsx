import { MessageCircle, Eye, Clock } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import type { Question } from '@/lib/supabase';
import { localizedField } from '@/lib/localizedContent';
import { virtualDoctorsForSpecialty } from '@/lib/catalog';

function timeAgo(date: string, lang: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.max(1, Math.floor(diff / 1000));
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1],
  ];
  const unit = units.find(([, secondsPer]) => seconds >= secondsPer) || units[units.length - 1];
  const value = -Math.floor(seconds / unit[1]);
  try {
    return new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(value, unit[0]);
  } catch {
    return `${Math.abs(value)} ${unit[0]} ago`;
  }
}

export default function QuestionCard({ question }: { question: Question }) {
  const { navigate } = useRouter();
  const { t, specialtyName, lang, dir } = useI18n();
  const answerCount = question.answers?.length ?? (question as any).answer_count ?? 0;
  const qDoctor:any = (question.answers as any)?.[0]?.doctor || virtualDoctorsForSpecialty((question.specialty as any)?.slug || '', lang, 5)[0];
  const title = localizedField(question as unknown as Record<string, unknown>, 'title', lang, question.title);
  const body = localizedField(question as unknown as Record<string, unknown>, 'body', lang, question.body);

  return (
    <button onClick={() => navigate(`/questions/${question.id}`)} className="card card-hover w-full p-5 text-start" dir={dir}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-800">{title}</h3>
        {question.specialty && <span className="badge shrink-0 whitespace-nowrap bg-teal-50 text-teal-700">{specialtyName(question.specialty)}</span>}
      </div>
      <p className="mb-3 line-clamp-2 text-sm text-gray-500">{body}</p>
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-2"><img src={(question as any).author_avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(question.author_name)}`} className="h-7 w-7 rounded-full border object-cover"/><span>{question.author_name}</span></span><span className="flex items-center gap-2"><img src={qDoctor?.photo_url || `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(qDoctor?.name||'specialist')}`} className="h-7 w-7 rounded-full border object-cover"/><span className="text-teal-600">{qDoctor?.name || 'Specialist'}</span></span>
        <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{answerCount} {t('questions.answers')}</span>
        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{question.views}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(question.created_at, lang)}</span>
      </div>
    </button>
  );
}
