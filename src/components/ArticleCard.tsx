import { useState } from 'react';
import { Clock, Eye, ArrowLeft } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import type { Article } from '@/lib/supabase';
import { localizedField } from '@/lib/localizedContent';

export default function ArticleCard({ article }: { article: Article }) {
  const { navigate } = useRouter();
  const { specialtyName, t, lang, dir } = useI18n();
  const [imgError, setImgError] = useState(false);
  const title = localizedField(article as unknown as Record<string, unknown>, 'title', lang, article.title);
  const excerpt = localizedField(article as unknown as Record<string, unknown>, 'excerpt', lang, article.excerpt);

  return (
    <button onClick={() => navigate(`/articles/${article.id}`)} className="card card-hover group flex w-full flex-col overflow-hidden text-start" dir={dir}>
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50">
        {!imgError && article.image_url ? (
          <img src={article.image_url} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl font-bold text-teal-300">Sahla Wa Basita</span>
          </div>
        )}
        {article.specialty && <span className="badge absolute end-3 top-3 bg-white/90 text-teal-700 shadow-sm">{specialtyName(article.specialty)}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-gray-800 transition-colors group-hover:text-teal-600">{title}</h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500">{excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.reading_time_min} {t('articles.reading_time')}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{article.views} {t('articles.views')}</span>
          </div>
          <span className="flex items-center gap-1 font-medium text-teal-600 transition-all group-hover:gap-2">
            {t('articles.read_more')}<ArrowLeft className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  );
}
