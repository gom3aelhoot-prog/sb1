import { useState } from 'react';
import { ArrowLeft, ExternalLink, Image as ImageIcon, Search, X } from 'lucide-react';

type ImageResult = {
  title?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  link?: string;
  source?: string;
  domain?: string;
  width?: number;
  height?: number;
};

export default function GoogleImagesPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<ImageResult | null>(null);

  const search = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const value = query.trim();
    if (!value) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/google-images?q=${encodeURIComponent(value)}&num=40`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'تعذر البحث عن الصور');
      setResults(Array.isArray(data.images) ? data.images : []);
      if (!data.images?.length) setError('لم يتم العثور على صور لهذه العبارة.');
    } catch (e) {
      setResults([]);
      setError(e instanceof Error ? e.message : 'تعذر البحث عن الصور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <ImageIcon className="text-teal-700" size={24} />
              صور Google
            </div>
            <p className="mt-1 text-sm text-slate-500">بحث الصور داخل SB1 عبر Serper</p>
          </div>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold shadow-sm">
            رجوع <ArrowLeft size={17} />
          </button>
        </div>

        <form onSubmit={search} className="sticky top-3 z-10 mb-5 flex gap-2 rounded-2xl border bg-white p-3 shadow-sm">
          <div className="relative flex-1">
            <Search size={19} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ابحث عن صورة..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-4 outline-none focus:border-teal-500"
            />
          </div>
          <button disabled={loading || !query.trim()} className="rounded-xl bg-teal-700 px-6 py-3 font-bold text-white disabled:opacity-50">
            {loading ? 'جارٍ البحث...' : 'بحث'}
          </button>
        </form>

        {error && <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">{error}</div>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((item, index) => (
            <button key={item.imageUrl || item.thumbnailUrl || index} onClick={() => setSelected(item)} className="group overflow-hidden rounded-2xl border bg-white text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="aspect-square bg-slate-100">
                <img src={item.thumbnailUrl || item.imageUrl} alt={item.title || ''} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <div className="line-clamp-2 text-xs font-bold text-slate-800">{item.title || 'صورة'}</div>
                <div className="mt-1 truncate text-[11px] text-slate-400">{item.source || item.domain || ''}</div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setSelected(null)}>
            <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <div className="font-extrabold">معاينة الصورة</div>
                <button onClick={() => setSelected(null)} className="rounded-full p-2 hover:bg-slate-100"><X size={20} /></button>
              </div>
              <img src={selected.imageUrl || selected.thumbnailUrl} alt={selected.title || ''} className="mx-auto max-h-[65vh] max-w-full rounded-2xl object-contain" />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 text-sm text-slate-500">{selected.source || selected.domain || ''}</div>
                {selected.link && (
                  <a href={selected.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold">
                    المصدر <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
